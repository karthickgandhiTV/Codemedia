import { withAuthenticator, Button, Flex, Text, Input, Label } from "@aws-amplify/ui-react";
import { useState, useRef } from "react";
import { API, Auth, Storage } from 'aws-amplify';
import { useRouter } from "next/router";
import { v4 as uuid } from "uuid";
import { createPost } from "@/graphql/mutations";
import dynamic from "next/dynamic";
const SimpleMdeReact = dynamic(() => import("react-simplemde-editor"), {
    ssr: false,
});

import "easymde/dist/easymde.min.css";
import '@aws-amplify/ui-react/styles.css';

const initialState = { title: "", content: "" };

function CreatePost() {
  const [post, setPost] = useState(initialState);
  const { title, content } = post;
  const router = useRouter();
  const [image, setImage] = useState(null);
  const imageFileInput = useRef(null);

  function onChange(e) {
    setPost(() => ({
      ...post,
      [e.target.name]: e.target.value,
    }));
  }

  async function createNewPost() {
    if (!title || !content) return;
    const id = uuid();
    post.id = id;
    const { username } = await Auth.currentAuthenticatedUser();
    post.username = username;
    if (image) {
      const filename = `${image.name}_${uuid()}`;
      post.coverImage = filename;
      await Storage.put(filename, image);
    }

    await API.graphql({
      query: createPost,
      variables: { input: post },
      authMode: "AMAZON_COGNITO_USER_POOLS",
    });
    router.push(`/posts/${id}`);
  }

  async function uploadImage() {
    imageFileInput.current.click();
  }

  function handleChange(e) {
    const fileUploaded = e.target.files[0];
    if (!fileUploaded) return;
    setImage(fileUploaded);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-blue-50 via-white to-blue-50">
      <div className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white shadow-xl rounded-lg p-8">
          <h1 className="text-4xl font-bold text-gray-800 mt-4 tracking-wide">Create New Post</h1>
          <input
            onChange={onChange}
            name="title"
            placeholder="Title"
            value={post.title}
            className="border-b pb-2 text-lg my-4 focus:outline-none w-full font-light text-gray-500 placeholder-gray-500"
          />
          {image && <img src={URL.createObjectURL(image)} className="my-4 rounded-lg shadow-lg" />}
          <SimpleMdeReact
            value={post.content}
            onChange={(value) => setPost({ ...post, content: value })}
            className="mt-4"
          />
          <input
            type="file"
            ref={imageFileInput}
            className="absolute w-0 h-0"
            onChange={handleChange}
          />
          <div className="flex justify-between mt-4">
            <button
              type="button"
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-2 rounded-full shadow-md transition"
              onClick={uploadImage}
            >
              Upload Cover Image
            </button>
            <button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-2 rounded-full shadow-md transition"
              onClick={createNewPost}
            >
              Create Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuthenticator(CreatePost);
