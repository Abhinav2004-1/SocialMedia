import React, { useEffect, useRef, useState } from "react";
import { AiOutlineLike, AiOutlinePlusCircle } from "react-icons/ai";
import { MdComment } from "react-icons/md";
import { useLazyQuery, useMutation } from "@apollo/client";

import "./post-card.scss";
import InteractionContainer, {
  Interactants,
} from "../PostContainer/Interaction/interaction";
import { PostLikeMutation } from "../../../GraphQL/mutations";
import { FetchPostComments } from "../../../GraphQL/gql";
import { COMMENTS } from "../CommentCard/inteface";
import DefaultCommentSection, {
  POSTCARDPROPS,
  SerializeComments,
} from "./reusables";
import CommentSection from "../CommentCard/comment-card";
import { useInteractionObserver } from "../../../Hooks/IntersectionObserver";

const PostCard: React.FC<POSTCARDPROPS> = (props) => {
  const { children } = props;
  // state
  const [likeStatus, setLikeStatus] = useState<string>(props.isPostLiked ? "#00acee" : "");
  const [isCommentVisible, setIsCommentVisible] = useState<boolean | null>(null);
  const [requestCount, setRequestCount] = useState<number>(0);
  const [isFetchlimitReached, setIsFetchLimitReached] = useState<boolean>(false);
  const [comments, setComments] = useState<Array<COMMENTS> | null>(null);
  const lastCardRef = useRef<HTMLDivElement>(null);
  const isIntersecting = useInteractionObserver(lastCardRef);

  // apollo-client
  const [GetComments] = useLazyQuery(FetchPostComments, {
    onCompleted: (data) => {
      const { GetPostComments }: { GetPostComments: Array<COMMENTS> } = data;
      let SerializedComments = [...GetPostComments];
      if (comments && SerializeComments.length > 0) {
        SerializedComments = SerializeComments(
          comments,
          SerializedComments
        );
      }
      setComments(SerializedComments);
      setRequestCount(requestCount + 1);
      if (SerializeComments.length < 10) setIsFetchLimitReached(true);
      if (SerializeComments.length === 0) setIsCommentVisible(null);
      else setIsCommentVisible(true);
    },
  });
  const [MutatePostLike] = useMutation(PostLikeMutation);

  // event functions
  const LikeClickHandler = (id: string) => {
    if (props.ChangeLikedPost) {
      if (likeStatus === "") {
        MutatePostLike({
          variables: {
            type: "like",
            id: props.UserInfo?.userID,
            Username: props.UserInfo?.username,
            auth_token: props.UserInfo?.auth_token,
            uid: props.UserInfo?.uid,
            PostID: id,
          },
        });
        props.ChangeLikedPost(false, props.id);
        setLikeStatus("#00acee");
      } else {
        MutatePostLike({
          variables: {
            type: "unlike",
            id: props.UserInfo?.userID,
            Username: props.UserInfo?.username,
            auth_token: props.UserInfo?.auth_token,
            uid: props.UserInfo?.uid,
            PostID: id,
          },
        });
        props.ChangeLikedPost(true, props.id);
        setLikeStatus("");
      }
    }
  };

  const CommentClickHandler = () => {
    if (!comments) {
      setIsCommentVisible(false);
      window.scrollTo(0, window.scrollY + 50);
      GetComments({
        variables: {
          id: props.UserInfo?.userID,
          auth_token: props.UserInfo?.auth_token,
          uid: props.UserInfo?.uid,
          PostID: props.id,
          requestCount,
        },
      });
    }
  };

  // effects
  useEffect(
    () => {
      if (isIntersecting && isFetchlimitReached === false) {
        GetComments({
          variables: {
            id: props.UserInfo?.userID,
            auth_token: props.UserInfo?.auth_token,
            uid: props.UserInfo?.uid,
            PostID: props.id,
            requestCount,
          },
        });
      }
    }, // eslint-disable-next-line
    [isIntersecting]
  );

  return (
    <React.Fragment>
      <main
        id="post-card-container"
        onClick={props.Click ? props.Click : undefined}
      >
        {children}
        <InteractionContainer>
          <Interactants
            id={props.id}
            hoverColor={likeStatus}
            Click={LikeClickHandler}
          >
            <AiOutlineLike />
          </Interactants>

          <Interactants id={props.id} hoverColor="#333" Click={() => {}}>
            <AiOutlinePlusCircle />
          </Interactants>

          <Interactants
            id={props.id}
            hoverColor="#333"
            Click={CommentClickHandler}
          >
            <MdComment />
          </Interactants>
        </InteractionContainer>
        {isCommentVisible === true && comments && (
          <>
            {props.UserInfo && (
              <>
                <CommentSection PostID={props.id} Comments={comments} userInfo={props.UserInfo}/>
                <footer ref={lastCardRef} style={{ height: "10px" }}></footer>
              </>
            )}
          </>
        )}
        {isCommentVisible === false && <DefaultCommentSection />}
      </main>
    </React.Fragment>
  );
};

export default PostCard;