import { useSelector } from "react-redux";

function CanView({ allowed = [], isPage, isReciever, children }) {
  const {
    userData: { role },
  } = useSelector((state) => state.account);

  if (allowed.includes(role)) {
    return children;
  }
  if (isPage) {
    return "NotAllowed";
  }
  return null;
}

export default CanView;
