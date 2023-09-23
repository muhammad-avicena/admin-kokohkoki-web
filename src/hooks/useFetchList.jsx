import axios from "axios";
import { useEffect, useState, useCallback } from "react";

const useFetchList = (options) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    axios(options)
      .then((response) => {
        setData(response.data.data);
      })
      .catch((error) => {
        console.error(error);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [options]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  return { data, loading, error };
};

export default useFetchList;
