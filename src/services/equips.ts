import Equip from "../class/equip";
import Buff from "../class/buff";

import configs from "../assets/configs";

const get = async (filter?: any, match?: any, limit?: number, skip?: number, sort?: { [key: string]: any }, project?: { [key: string]: any }) => {
  const params = new URLSearchParams();
  params.append("target", "equip");
  if (filter != null) params.append("filter", JSON.stringify(filter));
  if (match != null) params.append("match", JSON.stringify(match));
  if (limit != null) params.append("limit", limit.toString());
  if (skip != null) params.append("skip", skip.toString());
  if (sort != null) params.append("sort", JSON.stringify(sort));
  if (project != null) params.append("project", JSON.stringify(project));

  const url = `${configs.API_URL}?${params}`;

  const response = await fetch(url, { method: "GET" });
  const jsonDatas = await response.json();

  let res: Equip[] = [];
  for (let json_data of jsonDatas["data"]) {
    res.push(new Equip(json_data, json_data["buffs"]));
  }

  return res;
};

const getAll = async (buff_obj: { [buff_name: string]: Buff }) => {
  const params = new URLSearchParams();
  params.append("target", "equipsAllFile");
  const url = `${configs.API_URL}?${params}`;

  // Fetch APIを使用してjsonファイルを取得
  let response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'If-Modified-Since': localStorage.getItem('lastModified-equips-all') || ''
    },
    cache:"no-cache",
    // cache:"force-cache",
  });
  
  if(response.status===304){
    response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache:"force-cache",
    });

  }
  
  const lastModified = response.headers.get('Last-Modified');
  if(lastModified){
    localStorage.setItem('lastModified-equips-all', lastModified);
  // }else{
  //   localStorage.removeItem('lastModified-buffs-all');
  }

  
  // // 最終更新日時を取得
  // const lastModified = response.headers.get('Last-Modified');

  // // キャッシュのバリデーション
  // if (lastModified) {
  //   const cachedData = localStorage.getItem('cachedData');
  //   const cachedLastModified = localStorage.getItem('cachedLastModified');

  //   if (cachedLastModified && cachedLastModified === lastModified) {
  //     // キャッシュを使用
  //     console.log('キャッシュからデータを取得');
  //     return JSON.parse(cachedData);
  //   }
  // }
  
  let res_json = await response.json();

  let equip_obj: { [buff_name: string]: Equip } = {};

  for (let equip_json of res_json.data) {
    equip_obj[equip_json.name] = new Equip(equip_json, buff_obj);
  }

  return {equips:equip_obj, last_update:res_json.last_update};
};

const getLatestUpdateDatetime = async () => {
  // const params = new URLSearchParams();
  // params.append("target", "latestEquipUpdateDatetime");
  // const url = `${configs.API_URL}?${params}`;

  // // Fetch APIを使用してjsonファイルを取得
  // let response = await fetch(url, {
  //   method: 'GET',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   cache:"no-cache",
  // });
  // let res_json = await response.json();

  // return res_json.latest_datetime;
}

export { get, getAll, getLatestUpdateDatetime };
