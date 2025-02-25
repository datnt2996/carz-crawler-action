const myHeaders = new Headers();
myHeaders.append("accept", "*/*");
myHeaders.append("accept-language", "en-US,en;q=0.9,vi;q=0.8");
myHeaders.append("access-token", "");
myHeaders.append("display-type", "desktop");
myHeaders.append("if-none-match", "W/\"2c216-7+ZfV6n5ho8uJBBdkvLzWwKxst0\"");
myHeaders.append("origin", "https://www.khmer24.com");
myHeaders.append("priority", "u=1, i");
myHeaders.append("referer", "https://www.khmer24.com/");
myHeaders.append("sec-ch-ua", "\"Not(A:Brand\";v=\"99\", \"Google Chrome\";v=\"133\", \"Chromium\";v=\"133\"");
myHeaders.append("sec-ch-ua-mobile", "?0");
myHeaders.append("sec-ch-ua-platform", "\"macOS\"");
myHeaders.append("sec-fetch-dest", "empty");
myHeaders.append("sec-fetch-mode", "cors");
myHeaders.append("sec-fetch-site", "same-site");
myHeaders.append("user-agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36");

const requestOptions = {
  method: "GET",
  headers: myHeaders,
  redirect: "follow"
};

fetch("https://api-posts.khmer24.com/feed?fields=thumbnails,thumbnail,location,photos,user,store,renew_date,is_like,is_saved,category,link,object_highlight_specs,condition&functions=save,chat,like,apply_job,shipping,banner,highlight_ads%5Bobject_highlight_specs%5D&filter_version=4&meta=true&offset=30&category=cars-and-vehicles&sortby&date&max_ad_price&min_ad_price&province&district&commune", requestOptions)
  .then((response) => response.text())
  .then((result) => console.log(result))
  .catch((error) => console.error(error));

  
