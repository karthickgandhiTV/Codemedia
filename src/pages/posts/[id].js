import { API } from 'aws-amplify';
import { useRouter } from 'next/router';
import { useEffect, useState } from "react";
import ReactMarkDown from 'react-markdown';
import '../../aws-exports';
import { listPosts, getPost } from '@/graphql/queries';
import { createComment } from "../../graphql/mutations";
import { Auth, Hub, Storage } from "aws-amplify";
import { v4 as uuid } from "uuid";
import dynamic from "next/dynamic";
import { TextAreaField } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

// Dynamically import SimpleMdeReact to prevent server-side rendering issues
const SimpleMdeReact = dynamic(() => import('react-simplemde-editor'), {
    ssr: false, // This will ensure the component is only rendered on the client-side
});

const initialState = { message: "" };

export default function Post({ post }) {
    const [signedInUser, setSignedInUser] = useState(false);
    const [coverImage, setCoverImage] = useState(null);
    const [comment, setComment] = useState(initialState);
    const [showMe, setShowMe] = useState(false);
    const router = useRouter();
    const { message } = comment;

    useEffect(() => {
        updateCoverImage();
    }, []);

    // Check for a logged-in user
    useEffect(() => {
        authListener();
    }, []);

    if (router.isFallback) {
        return <div>Loading...</div>;
    }

    function toggle() {
        setShowMe(!showMe);
    }

    async function authListener() {
        Hub.listen("auth", (data) => {
            switch (data.payload.event) {
                case "signIn":
                    return setSignedInUser(true);
                case "signOut":
                    return setSignedInUser(false);
            }
        });
        try {
            await Auth.currentAuthenticatedUser();
            setSignedInUser(true);
        } catch (err) {}
    }

    async function updateCoverImage() {
        if (post.coverImage) {
            const imageKey = await Storage.get(post.coverImage);
            setCoverImage(imageKey);
        }
    }

    async function createTheComment() {
        if (!message) return;
        const id = uuid();
        comment.id = id;
        try {
            await API.graphql({
                query: createComment,
                variables: { input: comment },
                authMode: "AMAZON_COGNITO_USER_POOLS",
            });
        } catch (error) {
            console.log(error);
        }
        router.push("/my-posts");
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-r from-blue-50 via-white to-blue-50">
            <div className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
                <div className="bg-white shadow-xl rounded-lg p-8">
                    <h1 className="text-5xl font-bold text-gray-800 mt-4 tracking-wide">{post.title}</h1>
                    {coverImage && (
                        <img src={coverImage} className="mt-6 rounded-lg shadow-lg transition transform hover:scale-105" alt="Cover Image" />
                    )}
                    <p className="text-sm font-light text-gray-600 mt-4">By {post.username}</p>
                    <div className="mt-8 prose prose-lg text-gray-700">
                        <ReactMarkDown>{post.content}</ReactMarkDown>
                    </div>

                    {signedInUser && (
                        <div className="mt-10">
                            <button
                                type="button"
                                className="mb-4 bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-2 rounded-full shadow-md transition"
                                onClick={toggle}
                            >
                                Write a Comment
                            </button>
                            <div style={{ display: showMe ? "block" : "none" }} className="mt-4">
                                <TextAreaField
                                    label="Write a comment"
                                    name="comment"
                                    placeholder="Share your thoughts..."
                                    rows={3}
                                    value={comment.message}
                                    onChange={(e) =>
                                        setComment({ ...comment, message: e.target.value, postID: post.id })
                                    }
                                    className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg"
                                />
                                <button
                                    onClick={createTheComment}
                                    type="button"
                                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-2 rounded-full shadow-md transition"
                                >
                                    Save Comment
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export async function getStaticPaths() {
    const postData = await API.graphql({
        query: listPosts,
    });
    const paths = postData.data.listPosts.items.map(post => ({ params: { id: post.id } }));
    return {
        paths,
        fallback: true,
    };
}

export async function getStaticProps({ params }) {
    const { id } = params;
    const postData = await API.graphql({
        query: getPost,
        variables: { id },
    });
    return {
        props: {
            post: postData.data.getPost,
        },
        revalidate: 1,
    };
}
