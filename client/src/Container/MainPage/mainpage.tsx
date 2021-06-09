import React, { useEffect, useState } from "react";
import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  useQuery,
  useLazyQuery,
} from "@apollo/client";
import { UserInfo, PROPS, POSTS } from "./interfaces";
import { Context } from "./Context";
import {
  FetchUserData,
  PostsData,
  PrePostData,
} from "../../GraphQL/main-page-gql";
import LoadingPage from "../../Components/UI/LoadingPage/LoadingPage";

const client = new ApolloClient({
  uri: "https://localhost:8000/graphql",
  cache: new InMemoryCache(),
});

const Convert2Dto1D = (Array: Array<string>) => {
  const dummy = [];
  // O(n^2)
  for (let userInfo of Array) {
    for (let posts of userInfo) {
      dummy.push(posts);
    }
  }
  return dummy;
};

const MainPageWrapper: React.FC<PROPS> = (props) => {
  return (
    <React.Fragment>
      <ApolloProvider client={client}>
        <MainPage {...props} />
      </ApolloProvider>
    </React.Fragment>
  );
};

const MainPage: React.FC<PROPS> = (props) => {
  const [user_info, setUserinfo] = useState<UserInfo | null>(null);
  const [postid_list, setPostIDList] = useState<null | Array<string>>(null);
  const [posts, setPosts] = useState<null | Array<POSTS>>(null);
  const { loading } = useQuery(FetchUserData, {
    variables: {
      id: localStorage.getItem("userID"),
      uid: localStorage.getItem("uid"),
    },

    onCompleted: (data) => {
      const { GetUserData } = data;
      const { FollowingList } = GetUserData;
      if (FollowingList) {
        let data: string[] = [];
        if (FollowingList.length > 0) data = Convert2Dto1D(FollowingList);
        setPostIDList(data);
      }
    },

    onError: (error) => {
      console.log(error, 'UserData');
    },
  });
  const [, PostFetch] = useLazyQuery(PostsData, {
    onCompleted: ({ GetPostsData }) => {
      if (GetPostsData && posts) {
        const dummy = [...posts];
        console.log(dummy);
        console.log(postid_list);
      }
    },

    onError: (error) => {
      console.log(error, 'PostFetch');
    }
  });


  const PrePosts = useQuery(PrePostData, {
    variables: {
      id: localStorage.getItem("userID"),
      auth_token: localStorage.getItem("auth-token"),
    },

    onCompleted: (data) => {
      const { GetPrePostData } = data;
      GetPrePostData && setPosts(GetPrePostData);
    },

    onError: (error) => {
      console.log(error, 'PrePosts');
    }
  });

  useEffect(() => {
    const auth_token = localStorage.getItem("auth-token");
    const username = localStorage.getItem("username");
    const userID = localStorage.getItem("userID");
    auth_token && username && userID && setUserinfo({ auth_token, username, userID });
  }, []);

  if (loading === true || PrePosts.loading === true) {
    return <LoadingPage />;
  };

  if (PostFetch.loading) {}

  return (
    <React.Fragment>
      <Context.Provider value={{ userInfo: user_info }}></Context.Provider>
    </React.Fragment>
  );
};

export default MainPageWrapper;