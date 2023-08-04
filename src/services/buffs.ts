import Buff from "../class/buff";

import configs from "../assets/configs";

function get() {
  let res: any[] = [];

  return res;
}

const getAll = async () => {
  const params = new URLSearchParams();
  params.append("target", "buffsAllFile");
  const url = `${configs.API_URL}?${params}`;

  // Fetch APIを使用してjsonファイルを取得
  let response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'If-Modified-Since': localStorage.getItem('lastModified-buffs-all') || ''
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
    localStorage.setItem('lastModified-buffs-all', lastModified);
  // }else{
  //   localStorage.removeItem('lastModified-buffs-all');
  }
  
  console.log("lastModifiedlastModifiedlastModified", response, response.headers, lastModified)
  let res_json = await response.json();


  
  // const request = window.indexedDB.open(DB_NAME, 1);

  // request.onupgradeneeded = (event) => {
  //   this.db = (event.target as IDBOpenDBRequest).result as IDBDatabase;

  //   // オブジェクトストアの作成
  //   const charactorSaveDataObjectStore = this.db.createObjectStore(SAVEDATA_STORENAME, { keyPath: "id" });
  //   // インデックスの作成
  //   charactorSaveDataObjectStore.createIndex("name", "name", {
  //     unique: false,
  //   });

  //   // オブジェクトストアの作成
  //   const configObjectStore = this.db.createObjectStore(CONFIG_STORENAME, {
  //     keyPath: "id",
  //   });
  //   // インデックスの作成
  //   configObjectStore.createIndex("name", "name", { unique: false });
  // };

  // request.onsuccess = (event) => {
  //   this.db = (event.target as IDBOpenDBRequest).result as IDBDatabase;
  //   resolve();
  // };

  // request.onerror = (event) => {
  //   console.error("データベースのエラー:", (event.target as IDBOpenDBRequest).error);
  //   reject(new Error("Failed to open IndexedDB."));
  // };


  console.log("res_json", res_json)
  let buff_obj: { [buff_name: string]: Buff } = {};

  for (let buff_json of res_json.data) {
    buff_obj[buff_json.name] = new Buff(buff_json);
  }

  return {buffs:buff_obj, last_update:res_json.last_update};
};

const getLatestUpdateDatetime = async () => {
  // const params = new URLSearchParams();
  // params.append("target", "latestBuffUpdateDatetime");
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
