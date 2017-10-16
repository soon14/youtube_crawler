const wf = require("./writeIntoFile");
const httpreq = require("./sockhttps").httpreq;
const fs = require('fs');
const request = require('request');
const path = require('path');
const url = require('url');
const parseString = require('xml2js').parseString;
require('buffer').Buffer;
const querystring = require('querystring');
const util = require('util');
/*
function downloadPage(url) {
  return new Promise((resolve, reject) => {
    request({
      method: 'GET',
      uri: 'https://www.baidu.com'
    }, (error, response, body) => {
      if (error) {
        return reject(error);
      }
      return resolve(body);
    });
  });
}



 downloadPage('')
  .then((aaa) => {
    console.log(aaa);
    console.log(1);
  });
*/

const decrypt_signature = 0; //0 is not needs decrypt; 1 needs decrypt
const saveSrt = 1;  // 0 not save srt; otherwise save
const settitle = 0; // 0 auto title, 1 manual title
const srtdir = "/Users/l/Documents/srt";
/*
function parse(data, splitComma) {
  if (splitComma) {
    return data.split(",").map(i => parse(i));
  } else {
    var res = {};
    var nv;
    data.split("&").forEach((p) => {
      try {
        nv = p.split("=").map((v) => {
          return decodeURIComponent(v.replace(/\+/g, " "));
        });
        if (!(nv[0] in res)) res[nv[0]] = nv[1];
      } catch (e) {}
    });
    return res;
  }
}
*/
// httpreq({
//  'hostname':'www.youtube.com',
//        'path': "/watch?v=bnT5fMkAIxI",


//      }, false, (body) => {
//        console.log(body);
//      });

// var kkk = /;ytplayer\.config\s*=\s*(\{.+?\});ytplayer/
// var kkk = /;ytplayer\.config\s*=\s*(\{.+?\});/
// .exec(new Buffer(fs.readFileSync(path.join(__dirname,
//         './',
//         'aaaa'))).toString())
// console.log(kkk);
// return;
module.exports = class YoutubeUrlAndSrt {
    constructor() {
      this.finalUrl = "";
      this.title = "";
      this.youtubePage = "";
      this.vid = "";
      // this.CONFIG_REGEX = /;ytplayer\.config\s*=\s*({.*?});/;
      this.CONFIG_REGEX = /;ytplayer\.config\s*=\s*({.+?});/;
      // this.CONFIG_REGEX = /;ytplayer\.config\s*=\s*({.+?});ytplayer/;
    
      this.PLAYER_REGEX = /player-(.+?).js/;
    }
    parseTime(s) {
      s = s.toFixed(3);
      var array = s.split('.');
      var Hour = 0;
      var Minute = 0;
      var Second = array[0]; // 671
      var MilliSecond = array[1]; // 330
      if (Second >= 60) {
        Minute = Math.floor(Second / 60);
        Second = Second - Minute * 60;
        Hour = Math.floor(Minute / 60);
        Minute = Minute - Hour * 60;
      }
      if (Minute < 10) {
        Minute = '0' + Minute;
      }
      if (Hour < 10) {
        Hour = '0' + Hour;
      }
      if (Second < 10) {
        Second = '0' + Second;
      }
      return Hour + ':' + Minute + ':' + Second + ',' + MilliSecond;
    }
    processSrt(ttsurl, cb) {
      if (ttsurl) {
        var resultsrt = "";
        var _this = this;
        // console.log(ttsurl)
        httpreq({
          'hostname': 'www.youtube.com',
          'path': ttsurl,
        }, false, (data) => {
          parseString(data, function(err, result) {
            if (!result) {
              console.log(data);
              return false;
            }
            var text = result.transcript.text;
            var len = text.length;
            for (var i = 0; i < len; i++) {
              var index = i + 1;
              var content = text[i]._;
              var start = text[i].$['start'];
              var dur = text[i].$['dur'];
              resultsrt += index + '\r\n';
              var start_time = _this.parseTime(parseFloat(start));
              resultsrt += start_time;
              resultsrt += ' --> ';
              var end_time = _this.parseTime(parseFloat(start) + parseFloat(dur));
              resultsrt += end_time + ' \r\n';
              resultsrt += content + '\r\n\r\n';
            }
            resultsrt = resultsrt.replace(/(<div><br>)*<\/div>/g, '\n');
            resultsrt = resultsrt.replace(/<div>/g, '');
            /* replaces some html entities */
            resultsrt = resultsrt.replace(/&nbsp;/g, ' ');
            resultsrt = resultsrt.replace(/&quot;/g, '"');
            resultsrt = resultsrt.replace(/&amp;/g, '&');
            resultsrt = resultsrt.replace(/&lt;/g, '<');
            resultsrt = resultsrt.replace(/&gt;/g, '>');
            resultsrt = resultsrt.replace(/&#39;/g, "'");
            wf.writeIntoFile(path.resolve(srtdir, _this.title + ".srt"), resultsrt, 1);
          });
          cb();
        });

      } else {
        console.log("no subtitle!");
        cb();
      }


    }

   
    setbuf(body) {
      this.youtubePage = body;
      return this;
    }
    getPlayerjs(playerVersion, cb) {
      var jspath = path.join(__dirname,
        './',
        playerVersion + '.js');
      if (fs.existsSync(jspath)) {
        var jsfs = fs.readFileSync(jspath);
        cb(new Buffer(jsfs).toString());
      } else {
        fs.mkdirSync(path.join(__dirname,
          './', playerVersion.split('/')[0]));
        httpreq({
          'hostname': 's.ytimg.com',
          'path': `/yts/jsbin/player-${playerVersion}.js`,
        }, false, (body) => {
          wf.writeIntoFile(jspath, body, 1);
          cb(body);
        });
      }
    }
    getPlayerVersion(config) {
      const js = config['assets']['js'];
      const mm = this.PLAYER_REGEX.exec(js);
      if (!mm) {
        throw new Error('Cannot find player version');
      }
      return mm[1];
    }



    extractVideoInfo(cb) {
      // this.youtubePage.replace(this.CONFIG_REGEX,(m,p1)=>{
        // console.log(p1)
      // })
      // wf.writeIntoFile(path.join(__dirname,'./', 'aaaa'), this.youtubePage, 1);
      const mm = this.CONFIG_REGEX.exec(this.youtubePage);
      // console.log(mm)
      if (!mm) {
        return cb();
        // throw new Error('Invalid page format')
        console.log('Invalid page format')
      }

      const json = mm[1];
      const config = JSON.parse(json);



      if(!settitle){
        this.title = config['args']['title'].replace(/[\\\/:\*\?<>|"]/g, "-");
      }
      console.log(this.title+'.mp4');
      var srtPath = false;
      // console.log(config.args.caption_tracks)
      if(!!saveSrt){
        let srt_baseUrl = JSON.parse(config.args.player_response)
        .captions.playerCaptionsTracklistRenderer.captionTracks[0].baseUrl;
        srtPath = url.parse(srt_baseUrl).path;
        // console.log(url.parse(srt_baseUrl).path);

/*
        if (config.args.caption_tracks) {
          var caption_tracks = querystring.parse(config.args.caption_tracks);
          // var caption_tracks = parse(config.args.caption_tracks, true);
          // console.log(caption_tracks)
          if (util.isArray(caption_tracks.u)) {
            for (var i of caption_tracks.u) {
              if (i.match(/&lang=en/)) {
                srtPath = i;
                break;
              }
            }
          }else{
            srtPath = caption_tracks.u;
          }
          // console.log(srtPath);
          // console.log(caption_tracks.lc)
          if(srtPath){
            srtPath = url.parse(srtPath).path;
          }
        }
*/

      }
     

      const streamMap = config['args']['url_encoded_fmt_stream_map'];
      const resultList = [];
      for (let record of streamMap.split(',')) {
        const o = querystring.parse(record);
        // console.log(o)
        const result = {
          itag: o.itag,
          quality: o.quality,
          type: o.type,
          signature: o.s ? o.s : o.sig,
          url: o.url
        };
        resultList.push(result);
      }

      
      if (!!decrypt_signature) { // need decrypt signature

        // const playerVersion = this.getPlayerVersion(config);
        // this.getPlayerjs(playerVersion, (playerjs) => {});

        var uuu= resultList[0].url +
            // '&title=' + encodeURIComponent(this.title)+
            '&signature=';
        console.log(resultList);
        console.log(uuu);

        // httpreq({
        //   'hostname': 'www.youtube.com',
        //   'path':"/watch?v=" + this.vid,
        // }, false, (body) => {
        //   wf.writeIntoFile(path.join(__dirname,'./','index.html'), body, 1);
        // });

        return;

      } else { // don't need decrypt signature
        this.finalUrl = resultList[0].url +
          // '&signature=' + resultList[0].signature +
          '&title=' + encodeURIComponent(this.title);
        this.processSrt(srtPath, () => {
          cb();
        });
      }
    }
    settitle(num){
      this.title = num+'.mp4';
      return this;
    }
    getUrlById(id) {
      this.vid = id;
      httpreq({
        'hostname': 'www.youtube.com',
        'path': "/watch?v=" + this.vid,
      }, false, (body) => {
        this.setbuf(body).extractVideoInfo(() => {
          console.log(this.finalUrl)
        });
      });

    }


  } //end class