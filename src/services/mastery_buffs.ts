import Buff from "../class/buff";
import configs from "../assets/configs";

const get = async (
  filter?: any,
  match?: any,
  limit?: number,
  skip?: number,
  sort?: { [key: string]: any },
  project?: { [key: string]: any }
) => {
  const params = new URLSearchParams();
  params.append("target", "mastery_buff");
  if (filter != null) params.append("filter", JSON.stringify(filter));
  if (match != null) params.append("match", JSON.stringify(match));
  if (limit != null) params.append("limit", limit.toString());
  if (skip != null) params.append("skip", skip.toString());
  if (sort != null) params.append("sort", sort.toString());
  if (project != null) params.append("project", project.toString());

  const url = `${configs.API_URL}?${params}`;

  const response = await fetch(url, { method: "GET" });
  const jsonDatas = await response.json();

  let res: Buff[] = [];
  for (let json_data of jsonDatas["data"]) {
    res.push(new Buff(json_data));
  }

  return res;
};

export { get };
