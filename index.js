


/*
var path = arguments[0];
var reconfig = arguments[1];

if(path === undefined || path === null || path === "") {
  print("Usage : jjs -scripting [basedir]");
  exit(0);
}

var baseDir = new java.io.File(path);

if(baseDir.isDirectory() === false) {
  print("directory is not exist : " + path);
  exit(0);
}

baseDir = baseDir.getCanonicalFile();

var $readItemInfo = function(path) {
  var result = {};

  var url = path.substr( (baseDir + "").length ).replace(/\\|\\/g, "/");
  var timestamp = new java.io.File(path).lastModified();

  result.title = $baseName(url);
  result.author = "";
  result.subtitle = "";
  result.summary = "";
  result.image = "";
  result.url = encodeURI(url);
  result.date = new Date();
  result.duration = 0;
  return result;
};

var $baseName = function (str) {
   var base = new java.lang.String(str).substring(str.lastIndexOf('/') + 1);
    if(base.lastIndexOf(".") != -1)
        base = base.substring(0, base.lastIndexOf("."));
   return base;
}

var $hash = function(str) {
  var md5 =  java.security.MessageDigest.getInstance("MD5");
  var hash = md5.digest(str.getBytes());

  var hashStr = new java.lang.StringBuilder();
  for (var i = 0, l = hash.length; i < l; i++) {
    var h = hash[i];
    if (h < 0) {
        hashStr.append(java.lang.Integer.toHexString(h + 256));
    } else {
      if (h < 16) {
        hashStr.append("0");
      }
      hashStr.append(java.lang.Integer.toHexString(h));
    }
  }

  return hashStr.toString();
};

var $writeFile = function(fname, text, charset) {
  var osw = new java.io.OutputStreamWriter(
  new java.io.FileOutputStream(fname), charset);
  osw.write(text, 0, text.length);
  osw.close();
};

var $entries = function(base) {
  var paths = [];
  java.nio.file.Files.walk(base.toPath()).filter(function(p) {
    return (java.nio.file.Files.isReadable(p) === true)
        && (java.nio.file.Files.isDirectory(p) === false)
  }).forEach(function(p) {
    paths.push(p + "");
  });

  return paths;
};

var $readParameter = function(label, check) {
  var str = null;
  while (true) {
    str = readLine(label + ">").trim();
    if(check(str) === true) {
      break;
    } else {
      print("invalid!");
    }
  }
  return str;
};

var home = java.lang.System.getProperty("user.home");
var settingsFile = new java.io.File(home, ".podcasat.gen.config");

var setting = null;

if(settingsFile.isFile() === false || reconfig === "true") {
  setting = {};
} else {
  setting = JSON.parse(readFully(settingsFile + ""));
}

var parameter = (function(s) {
  var URL_REG_EXP = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
  var MAIL_REG_EXP =  /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

  var checkRequire = function(str) {
    return str !== undefined && str !== null && str.trim() !== "";
  };

  var checkURL = function(s) {
    return s !== undefined && s !== null && URL_REG_EXP.test(s);
  };

  var checkUndefined = function(s) {
    return s !== undefined &&  s !== null;
  };

  var checkEmail = function(s) {
    return s !== undefined && s !== null && MAIL_REG_EXP.test(s);
  };

  var checkImageLink = function(s) {
    return s !== undefined && s !== null && URL_REG_EXP.test(s);
  };

  var checkLocale = function(s) {
    return s === "ja";
  };

  if(checkRequire(s.title) === false) {
    s.title = $readParameter("input title", checkRequire);
  }

  if(checkURL(s.link) === false) {
    s.link = $readParameter("input link", checkURL);
  }

  if(checkLocale(s.locale) === false) {
    s.locale = $readParameter("input locale", checkLocale);
  }

  if(checkRequire(s.copyright) === false) {
    s.copyright = $readParameter("input copyright", checkRequire);
  }

  if(checkUndefined(s.subtitle) === false) {
    s.subtitle = $readParameter("input subtitle", checkUndefined);
  }

  if(checkRequire(s.author) === false) {
    s.author = $readParameter("input author", checkRequire);
  }

  if(checkEmail(s.email) === false) {
    s.email = $readParameter("input email", checkEmail);
  }

  if(checkUndefined(s.summary) === false) {
    s.summary = $readParameter("input summary", checkUndefined);
  }

  if(checkUndefined(s.description) === false) {
    s.description = $readParameter("input description", checkUndefined);
  }

  if(checkImageLink(s.image) === false) {
    s.image = $readParameter("input image", checkImageLink);
  }

  if(checkURL(s.baseurl) === false) {
    s.baseurl = $readParameter("input base url", checkURL);
  }

  if(s.baseurl.endsWith("/") === true) {
    s.baseurl = s.baseurl.slice(0, -1);
  }

  if(Array.isArray(s.categories) === false) {
    s.categories = [];
    while(true) {
      var c = $readParameter("input category", checkUndefined);
      if(c === "") {
        break;
      }
      if(s.categories.indexOf(c) === -1) {
        s.categories.push(c);
      }
    }
  }

  return s;
})(setting);

$writeFile(settingsFile + "", JSON.stringify(parameter), "UTF-8");

(function(title, link, locale, copyright, subtitle,
    author, email, summary, description, image,
    categories, entries, baseurl) {

  print("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
  print("<rss xmlns:itunes=\"http://www.itunes.com/dtds/podcast-1.0.dtd\" version=\"2.0\">");
  print("<channel>");
  print("    <title>${title}</title>");
  print("    <link>${link}</link>");
  print("    <language>${locale}</language>");
  print("    <copyright>${copyright}</copyright>");
  print("");
  print("    <itunes:subtitle>${subtitle}</itunes:subtitle>");
  print("    <itunes:author>${author}</itunes:author>");
  print("    <itunes:summary>${summary}</itunes:summary>");
  print("    <description>${description}</description>");
  print("    <itunes:owner>");
  print("        <itunes:name>${author}</itunes:name>");
  print("        <itunes:email>${email}</itunes:email>");
  print("    </itunes:owner>");
  print("");
  print("    <itunes:image href=\"${image}\" />");

  for (var i = 0; i < categories.length; i++) {
    var category = categories[i];
    print("<itunes:category text=\"${category}\"/>");
  }

  entries.forEach(function(path) {
    var info = $readItemInfo(path);
    var hash = $hash(baseurl + info.url);

    print("<item>");
    print("    <title>${info.title}</title>");
    print("    <itunes:author>${info.author}</itunes:author>");
    print("    <itunes:subtitle>${info.subtitle}</itunes:subtitle>");
    print("    <itunes:summary><![CDATA[${info.summary}]]></itunes:summary>");
    print("    <itunes:image href=\"${info.image}\" />");
    print("    <enclosure url=\"${baseurl}${info.url}\" />");
    print("    <guid>${hash}</guid>");
    print("    <pubDate>${info.date}</pubDate>");
    print("    <itunes:duration>${info.duration}</itunes:duration>");
    print("</item>");

  });

  print("</channel>");
  print("</rss>");
})(
  parameter.title,
  parameter.link,
  parameter.locale,
  parameter.copyright,
  parameter.subtitle,
  parameter.author,
  parameter.email,
  parameter.summary,
  parameter.description,
  parameter.image,
  parameter.categories,
  $entries(baseDir),
  parameter.baseurl
);
*/