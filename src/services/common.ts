import configs from "../assets/configs";

const getLatestUpdateDatetime = async () => {
  const params = new URLSearchParams();
  params.append("target", "latestSourceUpdateDatetime");
  const url = `${configs.API_URL}?${params}`;

  // Fetch APIを使用してjsonファイルを取得
  let response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache:"no-cache",
  });
  let res_json = await response.json();

  return res_json.latest_datetime;
}

export { getLatestUpdateDatetime };
