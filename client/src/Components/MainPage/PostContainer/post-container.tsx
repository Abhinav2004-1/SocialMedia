import React from "react";
import NoPostImage from "../../../assets/Images/no-post.svg";
import {
  POSTS,
  UserData,
  UserInfo,
} from "../../../Container/MainPage/interfaces";
import Spinner from "../../UI/Spinner/spinner";
import { MainPageContainer } from "../Reusables/reusables";
import PostCard, {
  PostCardHeader,
  PostCardImageContainer,
} from "./PostCard/post-card";

interface PROPS {
  PostList: Array<POSTS> | null;
  ProfileData: UserData | null;
  UserInfo: UserInfo | null;
  spinner: boolean;
  initialRequest: boolean;
}

const PostContainer: React.FC<PROPS> = (props) => {
  const { PostList, ProfileData, UserInfo, spinner, initialRequest } = props;

  if (initialRequest) {
    return (
      <div
        style={{
          minHeight: "300px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spinner />
      </div>
    );
  }

  if (PostList === null) {
    return (
      <React.Fragment>
        <MainPageContainer>
          <img
            draggable={false}
            src={NoPostImage}
            alt="no-post"
            width="40%"
            height="300px"
            style={{ marginTop: "60px" }}
          />
          <h3 style={{ marginTop: "30px", cursor: "context-menu" }}>
            No Posts Available! Lonely Bastard
          </h3>
        </MainPageContainer>
      </React.Fragment>
    );
  }
  return (
    <React.Fragment>
      <MainPageContainer>
        {PostList?.map((post) => {
          let isPostLiked = false;
          if (ProfileData) {
            if (ProfileData.LikedPosts.length > 0) {
              for (let id of ProfileData.LikedPosts) {
                if (post._id === id) {
                  isPostLiked = true;
                  break;
                }
              }
            }
          }
          return (
            <PostCard
              key={post._id}
              id={post._id}
              UserInfo={UserInfo}
              isPostLiked={isPostLiked}
            >
              <PostCardHeader
                Username={post.CreatorUsername}
                source={post.ProfilePicture}
              />
              <PostCardImageContainer source={post.Post} />
            </PostCard>
          );
        })}
        {spinner && <Spinner />}
      </MainPageContainer>
    </React.Fragment>
  );
};

export default React.memo(PostContainer);
