import { useState, useEffect } from "react";
import { API, graphqlOperation, Storage } from "aws-amplify";
import { listPosts } from "../graphql/queries";
import Link from "next/link";
import { onCreatePost } from "../graphql/subscriptions";
import ReactMarkDown from "react-markdown";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [post, setPost] = useState([]);

  let subOncreate;

  function setUpSubscriptions() {
    subOncreate = API.graphql(graphqlOperation(onCreatePost)).subscribe({
      next: (postData) => {
        console.log(postData.value);
        setPost(postData);
      },
    });
  }

  useEffect(() => {
    setUpSubscriptions();
    return () => {
      subOncreate.unsubscribe();
    };
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [post]);

  async function fetchPosts() {
    try {
      const postData = await API.graphql({
        query: listPosts,
      });
      const { items } = postData.data.listPosts;
      const postWithImages = await Promise.all(
        items.map(async (post) => {
          if (post.coverImage) {
            post.coverImage = await Storage.get(post.coverImage);
          }
          return post;
        })
      );
      setPosts(postWithImages);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  }

  return (
    <div className="bg-white pt-20 sm:pt-24 lg:pt-32 pb-24 sm:pb-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-left lg:mx-0">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Posts</h2>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-y-8 border-t border-gray-200 pt-10 sm:mt-16 sm:pt-16">
          {posts.map((post, index) => (
            <article 
              key={post.id} 
              className="flex flex-col justify-between bg-white shadow-lg rounded-lg p-6 transition transform hover:scale-105 hover:shadow-2xl"
            >
              <div className="group relative">
                {post.coverImage && (
                  <img
                    src={post.coverImage}
                    className="w-36 h-36 bg-contain bg-center 
                    rounded-full sm:mx-0 sm:shrink-0 mb-6"
                  />
                )}
                <h3 className="mt-3 text-3xl font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
                  <Link legacyBehavior href={`/posts/${post.id}`}>
                    <a>
                      <span className="absolute inset-0" />
                      {post.title}
                    </a>
                  </Link>
                </h3>
                <p className="mt-2 text-lg font-light text-gray-600">by {post.username}</p>
                <div className="mt-8 text-xl">
                  <ReactMarkDown className="prose" children={post.content} />
                </div>
                {post.comments?.items?.length > 0 &&
                  post.comments.items.map((comment, index) => (
                    <div
                      key={index}
                      className="py-8 px-8 max-w-xl mx-auto bg-gray-50 rounded-xl 
                      shadow-inner space-y-2 sm:py-1 sm:flex 
                      sm:items-center sm:space-y-0 sm:space-x-6 mt-6"
                    >
                      <div>
                        <p className="text-gray-600">{comment.message}</p>
                        <p className="text-gray-400 mt-1">- {comment.createdBy}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
