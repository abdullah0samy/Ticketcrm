import axios from "axios";
import { useCallback, useState } from "react";

function useGetOptions(url) {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getOptions = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!options.length) {
        const { results } = await axios.get(url);
        setOptions(results);
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setError(error);
    }
  }, [url, options.length]);

  return { options, isLoading, error, getOptions };
}

export default useGetOptions;
