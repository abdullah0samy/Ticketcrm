import { useSearchParams } from "react-router-dom";
import { useMemo } from "react";
import { filterNullValue } from "../utils/helper";
import qs from "qs";

function useParamsQuery() {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = useMemo(() => {
    return Object.fromEntries([...searchParams]);
  }, [searchParams]);

  const setParams = (paramsQuery) => {
    const result = qs.stringify(filterNullValue(paramsQuery), {
      arrayFormat: "comma",
    });

    setSearchParams(result);
  };

  const addParam = (paramQuery) => {
    const result = qs.stringify(filterNullValue({ ...params, ...paramQuery }), {
      arrayFormat: "comma",
    });
    console.log(result);
    setSearchParams(result);
  };
  const deleteParam = (paramName) => {
    delete params[paramName];
    setSearchParams({ ...params });
  };
  const restParams = () => {
    setSearchParams();
  };

  return {
    params,
    addParam,
    deleteParam,
    setParams,
    restParams,
  };
}

export default useParamsQuery;
