import { gql } from "@apollo/client";

export const FetchUserData = gql`
  query ($id: String!, $uid: String!, $auth_token: String!) {
    GetUserData(id: $id, uid: $uid, auth_token: $auth_token) {
      Username
      Followers
      Following
      ProfilePicture
      Posts
      FollowingList {
        Username
        ProfilePicture
        Posts
      }
    }
  }
`;

export const PostsData = gql`
  query (
    $auth_token: String!
    $Posts: [String!]
    $id: String!
    $request_count: Int!
    $uid: String!
  ) {
    GetPostsData(
      auth_token: $auth_token
      Posts: $Posts
      id: $id
      request_count: $request_count
      uid: $uid
    ) {
      Post
      Caption
      PostDate
      CreatorID
      CreatorUsername
    }
  }
`;

export const PrePostData = gql`
  query ($auth_token: String!, $id: String!, $uid: String!) {
    GetPrePostData(auth_token: $auth_token, id: $id, uid: $uid) {
      Post
      Caption
      PostDate
      CreatorID
      CreatorUsername
    }
  }
`;

export const ProfileData = gql`
  query (
    $auth_token: String!
    $id: String!
    $uid: String!
    $searchID: String!
    $verify: Boolean!
    $Posts: [String]
  ) {
    GetProfileData(
      auth_token: $auth_token
      id: $id
      uid: $uid
      searchID: $searchID
      verify: $verify
      Posts: $Posts
    ) {
      Followers
      Following
      Posts
      ProfilePicture
      Verified
      PostData {
        _id
        Post
        CreatorUsername
        CreatorID
        Caption
        PostDate
      }
    }
  }
`;