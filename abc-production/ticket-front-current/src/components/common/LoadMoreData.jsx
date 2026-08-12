import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { t } from "i18next";
import { Button } from "@nextui-org/react";

function LoadMoreData({ next, dispatchFn, btnProps = {} }) {
  const dispatch = useDispatch();
  const [isLoadMore, setLoadMore] = useState(false);

  // fetch more data
  const handleLoadMore = async () => {
    try {
      setLoadMore(true);
      await dispatch(dispatchFn()).unwrap();
    } catch (error) {
      console.log(error);
    } finally {
      setLoadMore(false);
    }
  };

  if (next) {
    return (
      <div className="flex items-center justify-center py-4">
        <Button isLoading={isLoadMore} onClick={handleLoadMore} {...btnProps}>
          {t("load more")}
        </Button>
      </div>
    );
  }

  return null;
}

export default LoadMoreData;
