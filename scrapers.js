/* Depends on notes.js */

function time_ago(utc /* time in milliseconds */){
  let now = new Date();
  let then = new Date(utc);

  let elapsed_minutes = (now - then) / 6e4;

  let time_num, time_word;

  if (elapsed_minutes < 60) {
    time_num = Math.floor(elapsed_minutes);
    time_word = "minute";
  } else if (elapsed_minutes < 60 * 24) {
    time_num = Math.floor(elapsed_minutes / 60);
    time_word = "hour";
  } else if (elapsed_minutes < 60 * 24 * 7) {
    time_num = Math.floor(elapsed_minutes / (60 * 24));
    time_word = "day";
  } else {
    /* For months and years, I don't want to be as precise, so 
     * I just subtract the current one from the past one to get the
     * time elapsed */
    let months = now.getMonth() - then.getMonth();
    let years = now.getYear() - then.getYear();
    if (years < 1) {
      time_num = months;
      time_word = "month";
    } else {
      time_num = years;
      time_word = "year";
    }
  }

  if (time_num > 1) {
    time_word += "s";
  }

  return time_num + " " + time_word + " ago";
}

//**************************************************************************************
//
// HACKERNEWS
//
//**************************************************************************************

 // "by" : "dhouston",
 //  "descendants" : 71,
 //  "id" : 8863,
 //  "kids" : [ 8952, 9224, 8917, 8884, 8887, 8943, 8869, 8958, 9005, 9671, 8940, 9067, 8908, 9055, 8865, 8881, 8872, 8873, 8955, 10403, 8903, 8928, 9125, 8998, 8901, 8902, 8907, 8894, 8878, 8870, 8980, 8934, 8876 ],
 //  "score" : 111,
 //  "time" : 1175714200,
 //  "title" : "My YC app: Dropbox - Throw away your USB drive",
 //  "type" : "story",
 //  "url" : "http://www.getdropbox.com/u/2/screencast.html"

function display_hn_post(post) {
  let wrapper = document.createElement("div");
  wrapper.className = "post hackernews_post";

  let title = document.createElement("div");
  title.innerHTML = post.title;
  title.className = "title";

  let post_link = document.createElement("a");
  post_link.href = post.url;
  post_link.className = "no_underline";

  let details = document.createElement("div");
  let when = time_ago(post.time * 1000);
  // details.innerHTML = post.score + " points by " + post.by + " " + hours + " hours ago | " + post.descendants + " comments";
  details.innerHTML = "posted " + when +" | " + post.descendants + " comments";
  details.className = "details";

  let comment_link = document.createElement("a");
  comment_link.href = "https://news.ycombinator.com/item?id=" + post.id;
  comment_link.className = "no_underline";

  document.getElementById("hackernews_posts").appendChild(wrapper);
  wrapper.appendChild(post_link);
  wrapper.appendChild(comment_link);
  post_link.appendChild(title);
  comment_link.appendChild(details);
}

function load_and_display_hn_post(post_index) {
  let post_url = "https://hacker-news.firebaseio.com/v0/item/" + post_index + ".json";
  let disp = function(err, post) {
    if (err !== null) {
      alert('Something went wrong: ' + err);
    } else {
      display_hn_post(post);
    }
  }
  getJSON(post_url, {callback:disp});
}

function load_hackernews(n_posts) {
  let process_posts = function(err, posts) {
    if (err !== null) {
      alert('Something went wrong: ' + err);
    } else {
      for (let post in posts.slice(0, n_posts)) {
        load_and_display_hn_post(posts[post]);
      }
      document.getElementById("hackernews_posts").style.opacity = 1.0;
    }
  }

  // https://github.com/HackerNews/API
  getJSON("https://hacker-news.firebaseio.com/v0/topstories.json", {callback:process_posts});
}

//**************************************************************************************
//
// Reddit
//
//**************************************************************************************

function display_reddit_post(post, subreddit) {
  let wrapper = document.createElement("div");
  wrapper.className = "post reddit_post";

  let title = document.createElement("div");
  title.innerHTML = post.title;
  title.className = "title";

  let post_link = document.createElement("a");
  post_link.href = post.url;
  post_link.className = "no_underline";

  let details = document.createElement("div");
  let when = time_ago(post.created_utc * 1000);
  details.innerHTML = "submitted " + when + " | " + post.num_comments + " comments";
  details.className = "details";

  let comment_link = document.createElement("a");
  comment_link.href = post.permalink;
  comment_link.className = "no_underline";

  document.getElementById(subreddit + "_posts").appendChild(wrapper);
  wrapper.appendChild(post_link);
  wrapper.appendChild(comment_link);
  post_link.appendChild(title);
  comment_link.appendChild(details);
}

function load_subreddit(subreddit, n_posts){
  let process_posts = function(err, posts) {
    if (err !== null) {
      alert('Something went wrong: ' + err);
    } else {
      for (let post in posts.data.children) {
        display_reddit_post(posts.data.children[post].data, subreddit);
      }
      document.getElementById(subreddit + "_posts").style.opacity = 1.0;
    }
  }

  getJSON("https://www.reddit.com/r/" + subreddit + "/.json?limit=" + n_posts, {callback:process_posts});
}

function load_posts() {
  load_hackernews(20);
  load_subreddit("AskReddit", 20);
}