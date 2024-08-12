import { withAuthenticator, Authenticator, Button } from "@aws-amplify/ui-react";
import { Auth } from "aws-amplify";
import { useState, useEffect } from "react";
import '@aws-amplify/ui-react/styles.css';

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const user = await Auth.currentAuthenticatedUser();
    setUser(user);
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-2xl p-12 max-w-lg w-full mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Profile</h1>
        <div className="mb-8">
          <h2 className="text-xl font-medium text-gray-700 my-2">
            Username: <span className="text-gray-900">{user.username}</span>
          </h2>
          <p className="text-lg text-gray-700">
            Email: <span className="text-gray-900">{user.attributes.email}</span>
          </p>
        </div>
        <Authenticator>
          {({ signOut }) => (
            <Button
              isFullWidth={true}
              variation="primary"
              size="large"
              loadingText="Signing Out..."
              onClick={signOut}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition"
            >
              Sign Out
            </Button>
          )}
        </Authenticator>
      </div>
    </div>
  );
}

export default withAuthenticator(Profile);
