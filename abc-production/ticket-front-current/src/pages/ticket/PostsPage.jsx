import React, { useEffect } from "react";
import PostCard from "../../components/cards/PostCard";
import AddPostForm from "../../components/form/AddPostForm";
import { useDispatch, useSelector } from "react-redux";
import { getMorePosts, getPosts } from "../../redux/actions/postActions";
import HandleError from "../../components/common/HandleError";
import LoadMoreData from "../../components/common/LoadMoreData";

function PostsPage() {
  const dispatch = useDispatch();
  const {
    data: { results, next },
    isLoading,
    error,
  } = useSelector((state) => state.posts);

  useEffect(() => {
    dispatch(getPosts());
  }, [dispatch]);

  return (
    <div className="py-4">
      <AddPostForm className={"mt-4"} />
      <HandleError
        isLoading={isLoading}
        error={error}
        isEmpty={results.length === 0}
      >
        <div className="flex flex-col items-center gap-3 py-3 pt-6">
          {results.map((post) => (
            <PostCard key={post.id} postData={post} />
          ))}
        </div>
        <LoadMoreData next={next} dispatchFn={() => getMorePosts(next)} />
      </HandleError>
    </div>
  );
}
export default PostsPage;
