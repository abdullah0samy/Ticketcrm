import React, { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import AddPostCard from "../components/cards/AddPostCard";
import NoteCard from "../components/cards/NoteCard";
import HandelError from "../components/elements/HandelError";
import MoreData from "../components/elements/MoreData";
import { getNextNotes, getNotes } from "./../store/Slice/noteSlice";

function Home() {
  const {
    userData: { is_superuser, department, image },
  } = useSelector((state) => state.user);
  const [pageNum, setPageNum] = useState(2);
  const { noteList, error, next, loading } = useSelector((state) => state.note);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getNotes());
  }, [dispatch]);

  const getMoreData = async () => {
    try {
      await dispatch(getNextNotes(next)).unwrap();
      setPageNum(pageNum + 1);
    } catch (error) {
      console.log(error);
    }
  };

  if (!is_superuser || !department.reciever || department.id === 0) {
    return <Navigate to="/tickets/sent/?page=1&size=10" />;
  }

  const noteMapping = noteList.map((note) => {
    return (
      <Col md={8} key={note.id} className="mb-4">
        <NoteCard noteData={note} />
      </Col>
    );
  });

  return (
    <div>
      <Row className="center">
        <Col md={8}>
          <AddPostCard userImg={image} />

        </Col>
      </Row>
      <Row className="center">{noteMapping}</Row>
      <HandelError loading={loading} error={error} dataList={noteList} />
      <MoreData size="md" next={next} action={getMoreData} />
    </div>
  );
}

export default Home;
