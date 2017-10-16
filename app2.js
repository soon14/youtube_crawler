const path = require('path');
const querystring = require('querystring');
const wf = require("./writeIntoFile");
const httpreq = require("./sockhttps").httpreq;
const YoutubeUrlAndSrt = require("./app1");


' Bloomberg   UCUMZ7gohGI9HcU9VNsr2FJQ\
EnglishLessons4U  UC4cmBAit8i_NJZE8qK8sfpA\
TheEllenShow  UCp0hYYBW6IMayGgR-WeoCvQ\
MIT   UCEBb1b_L6zDS3xTUrIALZOw  \
latenight UC8-Th83bH_thdKZDJCrn88g\
Meeting C++ YT Kanalseite UCJpMLydEYA08vusDkq3FmjQ\
BoostCon UC5e__RG9K3cHrPotPABnrwg\
  CppCon  UCMlGfpWw-RUdWX_JbLCukXg\
';



function mkqs(obj) {
  return querystring.stringify(obj);
}




class GetVideoBySearch { // get video from search lists
  constructor() {

      this.getsubscription = "/youtube/v3/subscriptions?" +
        mkqs({
          "key": "AIzaSyBCPiqtf4MWIOgV7RY_yjgDG_h3TSBWuCc",
          "mySubscribers": "true",
          "part": "snippet",
          "mine": "true"
        });
      this.getchannelidurl = "/youtube/v3/channels?" +
        mkqs({
          "key": "AIzaSyBCPiqtf4MWIOgV7RY_yjgDG_h3TSBWuCc",
          "part": "id",
          "forUsername": "UCMlGfpWw-RUdWX_JbLCukXg",
        });
      this.searchQS = {
        'maxResults': '20',
        "part": "snippet",
        "channelId": "UCMlGfpWw-RUdWX_JbLCukXg",
        "order": "viewCount",
        // "order": "date",
        // "q": "leonardo dicaprio",
        "type": "video",
        // "pageToken":"CKABEAA",
        // "videoSyndicated":"true",
        "key": "AIzaSyBCPiqtf4MWIOgV7RY_yjgDG_h3TSBWuCc"
      };
      this.searchName = path.join(__dirname,
        '../', "youtubeTempUrl");
      this.searchData = {};
      this.resultArr = [];
      this.k = 1;
      this.total = 0;
      this.getUrlById = new YoutubeUrlAndSrt();
      this.channelid = '';
    }
    /*
    order:
    date – Resources are sorted in reverse chronological order based on the date they were created.
    rating – Resources are sorted from highest to lowest rating.
    relevance – Resources are sorted based on their relevance to the search query. This is the default value for this parameter.
    title – Resources are sorted alphabetically by title.
    videoCount – Channels are sorted in descending order of their number of uploaded videos.
    viewCount – Resources are sorted from highest to lowest number of views. For live broadcasts, videos are sorted by number of concurrent viewers while the broadcasts are ongoing
    type:
    channel
    playlist
    video
    */
  main() {
    console.log("https://www.googleapis.com/youtube/v3/search?" + querystring.stringify(this.searchQS))
    // return;
    httpreq({
      'path': "/youtube/v3/search?" + querystring.stringify(this.searchQS),
      'hostname':'www.googleapis.com'
    }, false, (body) => {
      this.searchData = JSON.parse(body);
      this.k = 1;
      this.resultData = "";
      this.loop();
    });
  }
  getsubscription(){
     httpreq({
      'path': this.getsubscription,
      'hostname':'www.googleapis.com'
    }, false, (body) => {
      console.log(body);
    });
  }
  getchannelid(){
    httpreq({
      'path': this.getchannelidurl,
      'hostname':'www.googleapis.com'
    }, false, (body) => {
      console.log(body);
      return;
      this.searchQS['channelId']=JSON.parse(body).items[0].id;
      this.main();
      // console.log(this.channelid)
    });
  }
  loop() {
    if (this.searchData.items.length) {
      var id = this.searchData.items.shift().id.videoId;
      httpreq({
        'path': "/watch?v=" + id,
           'hostname':'www.youtube.com'
      }, false, (body) => {
        this.getUrlById.setbuf(body).settitle(this.total).extractVideoInfo(() => {
          this.resultArr.push(this.getUrlById.finalUrl);
          this.total++;
          this.k++;
          this.loop();
        });
      });
    } else {
      console.log(this.total);
      if (this.searchData.nextPageToken) {
         wf.writeIntoFile(this.searchName, this.resultArr.join("\n")+"\n", 0);
         this.resultArr=[];
        this.searchQS.pageToken = this.searchData.nextPageToken;
        this.main();
      }else{
     wf.writeIntoFile(this.searchName, this.resultArr.join("\n"), 0);

      }
    }
  }


}
// var sl = new GetVideoBySearch();
// sl
// // .getchannelid()
// .main()
// ;


class GetVideoByPlaylist {
  constructor() {
    this.playlistName = path.join(__dirname,
      '../',
      "youtubeTempUrl");
    this.total = 0;
    this.playlistData = {};
    this.resultArr = [];
    this.getUrlById = new YoutubeUrlAndSrt();
    this.k = 1;
    this.playlistQS = {
      'maxResults': 20,
      'playlistId': "PLSE8ODhjZXjYgTIlqf4Dy9KQpQ7kn1Tl0",
      'part': 'snippet',
      'key': 'AIzaSyBCPiqtf4MWIOgV7RY_yjgDG_h3TSBWuCc'
    };
  }
  main() {
    httpreq({
      'path': '/youtube/v3/playlistItems?' + querystring.stringify(this.playlistQS),
      'hostname':'www.googleapis.com'
    }, false, (body) => {
      this.playlistData = JSON.parse(body);
      this.k = 1;
      this.loop();
    });
  }
  loop() {
    if (this.playlistData.items.length) {
      var id = this.playlistData.items.shift().snippet.resourceId.videoId;
      httpreq({
        'path': "/watch?v=" + id,
        'hostname':'www.youtube.com'
      }, false, (body) => {
        this.getUrlById.setbuf(body).settitle(this.total).extractVideoInfo(() => {
          this.resultArr.push(this.getUrlById.finalUrl);
          this.total++;
          this.k++;
          this.loop();
        });
      });
    } else {
      console.log(this.total);
      if (this.playlistData.nextPageToken) {
        wf.writeIntoFile(this.playlistName, this.resultArr.join("\n")+"\n", 0);
        this.resultArr=[];
        this.playlistQS.pageToken = this.playlistData.nextPageToken;
        this.main();
      }else{
        wf.writeIntoFile(this.playlistName, this.resultArr.join("\n"), 0);
      }
    }
  }
}


var pl = new GetVideoByPlaylist();
pl
.main()
;
//https://www.youtube.com/watch?v=KSN4QYgAtao

// var gytb = new YoutubeUrlAndSrt();
// gytb
// .getUrlById("smqT9Io_bKo")


// .getUrlById("e-ORhEE9VVg")
// .getUrlById("QflekFEDv9Y")
// .getUrlById("r1DZ9v5eakE")
// .getUrlById("K_mzQZfvI04")
// .getUrlById("sU_Yu_USrNc")
// .getUrlById("W6JhcjbWEwg")
// console.log(decodeURIComponent("How%20slang%20is%20%22made%22%20in%20English%20-%20bad-ass%2C%20wicked%2C%20deadly%2C%20sick").replace(/[\\\/:\*\?<>|"]/g, "-"))