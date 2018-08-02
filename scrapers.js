/* Depends on notes.js */
function getHTML(site_url, options) {
  let callback = function(status, response) {};
  if ('callback' in options) {
    callback = options.callback;
  }
  // Bypass cross origin problems
  let url = 'https://allorigins.me/get?&url=' + encodeURIComponent(site_url);
  let xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.responseType = 'json';
  xhr.onload = function() {
    let allorigins_status = xhr.status;
    if (allorigins_status === 200) {
      let site_status = xhr.response.status.http_code;
      if (site_status == 200) {
        callback(null, xhr.response.contents);
      } else {
        callback(site_status, xhr.response.contents);
      }
    } else {
      callback(allorigins_status, xhr.response.contents);
    }
  };
  xhr.send();
}

// https://stackoverflow.com/questions/12460378/how-to-get-json-from-url-in-javascript
function getJSON(url, options) {
  let message = '';
  let callback = function(status, response) {};
  if ('message' in options) {
    message = options.message;
  }
  if ('callback' in options) {
    callback = options.callback;
  }
  let xhr = new XMLHttpRequest();
  xhr.open('GET', url + '?' + message, true);
  xhr.responseType = 'json';
  xhr.onload = function() {
    let status = xhr.status;
    if (status === 200) {
      callback(null, xhr.response);
    } else {
      callback(status, xhr.response);
    }
  };
  xhr.send();
}

function time_ago(utc /* time in milliseconds */){
  let now = new Date();
  let then = new Date(utc);

  let elapsed_minutes = (now - then) / 6e4;

  let time_num, time_word;

  if (elapsed_minutes < 60) {
    time_num = Math.floor(elapsed_minutes);
    time_word = 'minute';
  } else if (elapsed_minutes < 60 * 24) {
    time_num = Math.floor(elapsed_minutes / 60);
    time_word = 'hour';
  } else if (elapsed_minutes < 60 * 24 * 7) {
    time_num = Math.floor(elapsed_minutes / (60 * 24));
    time_word = 'day';
  } else {
    /* For months and years, I don't want to be as precise, so
     * I just subtract the current one from the past one to get the
     * time elapsed */
    let months = now.getMonth() - then.getMonth();
    let years = now.getYear() - then.getYear();
    if (years < 1) {
      time_num = months;
      time_word = 'month';
    } else {
      time_num = years;
      time_word = 'year';
    }
  }

  if (time_num > 1) {
    time_word += 's';
  }

  return time_num + ' ' + time_word + ' ago';
}

//**************************************************************************************
//
// HACKERNEWS
//
//**************************************************************************************

 // 'by' : 'dhouston',
 //  'descendants' : 71,
 //  'id' : 8863,
 //  'kids' : [ 8952, 9224, 8917, 8884, 8887, 8943, 8869, 8958, 9005, 9671, 8940, 9067, 8908, 9055, 8865, 8881, 8872, 8873, 8955, 10403, 8903, 8928, 9125, 8998, 8901, 8902, 8907, 8894, 8878, 8870, 8980, 8934, 8876 ],
 //  'score' : 111,
 //  'time' : 1175714200,
 //  'title' : 'My YC app: Dropbox - Throw away your USB drive',
 //  'type' : 'story',
 //  'url' : 'http://www.getdropbox.com/u/2/screencast.html'

function display_hn_post(post) {
  let wrapper = document.createElement('div');
  wrapper.className = 'post hackernews_post';

  let title = document.createElement('div');
  title.innerHTML = post.title;
  title.className = 'title';

  let post_link = document.createElement('a');
  post_link.href = post.url;
  post_link.className = 'no_underline';

  let details = document.createElement('div');
  let when = time_ago(post.time * 1000);
  // details.innerHTML = post.score + ' points by ' + post.by + ' ' + hours + ' hours ago | ' + post.descendants + ' comments';
  details.innerHTML = 'posted ' + when +' | ' + post.descendants + ' comments';
  details.className = 'details';

  let comment_link = document.createElement('a');
  comment_link.href = 'https://news.ycombinator.com/item?id=' + post.id;
  comment_link.className = 'no_underline';

  document.getElementById('hackernews_posts').appendChild(wrapper);
  wrapper.appendChild(post_link);
  wrapper.appendChild(comment_link);
  post_link.appendChild(title);
  comment_link.appendChild(details);
}

function load_and_display_hn_post(post_index) {
  let post_url = 'https://hacker-news.firebaseio.com/v0/item/' + post_index + '.json';
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
    document.getElementById('hackernews_posts').style.display = 'block';
    document.getElementById('hackernews_spinner').style.display = 'none';
    if (err !== null) {
      alert('Something went wrong: ' + err);
    } else {
      for (let post in posts.slice(0, n_posts)) {
        load_and_display_hn_post(posts[post]);
      }
      document.getElementById('hackernews_posts').style.opacity = 1.0;
    }
  }

  // https://github.com/HackerNews/API
  getJSON('https://hacker-news.firebaseio.com/v0/topstories.json', {callback:process_posts});
}

//**************************************************************************************
//
// Reddit
//
//**************************************************************************************

function display_reddit_post(post, subreddit) {
  let wrapper = document.createElement('div');
  wrapper.className = 'post reddit_post';

  let title = document.createElement('div');
  title.innerHTML = post.title;
  title.className = 'title';

  let post_link = document.createElement('a');
  post_link.href = post.url;
  post_link.className = 'no_underline';

  let details = document.createElement('div');
  let when = time_ago(post.created_utc * 1000);
  details.innerHTML = 'submitted ' + when + ' | ' + post.num_comments + ' comments';
  details.className = 'details';

  let comment_link = document.createElement('a');
  comment_link.href = 'http://www.reddit.com' + post.permalink;
  comment_link.className = 'no_underline';

  document.getElementById(subreddit + '_posts').appendChild(wrapper);
  wrapper.appendChild(post_link);
  wrapper.appendChild(comment_link);
  post_link.appendChild(title);
  comment_link.appendChild(details);
}

function load_subreddit(subreddit, n_posts){
  let process_posts = function(err, posts) {
    document.getElementById(subreddit + '_posts').style.display = 'block';
    document.getElementById(subreddit + '_spinner').style.display = 'none';
    if (err !== null) {
      alert('Something went wrong: ' + err);
    } else {
      for (let post in posts.data.children) {
        display_reddit_post(posts.data.children[post].data, subreddit);
      }
      document.getElementById(subreddit + '_posts').style.opacity = 1.0;
    }
  }

  getJSON('https://www.reddit.com/r/' + subreddit + '/.json?limit=' + n_posts, {callback:process_posts});
}


//**************************************************************************************
//
// nCatLab
//
//**************************************************************************************

function display_nlab_page(page) {
  let wrapper = document.createElement('div');
  wrapper.className = 'post nlab_post';
  wrapper.id = 'nlab_post';

  let title = document.createElement('div');
  title.className = 'nlab_post_heading';
  let nlab_name = document.createElement('span');
  nlab_name.innerHTML = 'nlab';
  let title_text = document.createElement('h1');
  title_text.innerHTML = page.title;
  title_text.className = 'nlab_title'
  title.appendChild(nlab_name);
  title.appendChild(title_text);

  let post_link = document.createElement('a');
  post_link.href = page.url;
  post_link.className = 'no_underline';

  let post_body = document.createElement('div');
  //let when = time_ago(post.created_utc * 1000);
  post_body.className = 'post_body';

  page.contents.forEach(function(node) {
    post_body.appendChild(node);
  });

  document.getElementById('nlab_posts').appendChild(wrapper);
  wrapper.appendChild(post_link);
  wrapper.appendChild(post_body);
  post_link.appendChild(title);
}

function load_nlab_page(title, url) {
  let process_page = function(err, page) {
    if (err !== null) {
      alert('Something went wrong: ' + err);
    } else {
      let parser = new DOMParser();
      let html = parser.parseFromString(page, 'text/xml');

      // Find the first child of the 'revision' div which is not the title or
      // table of contents or #text (which seems to represent a line break)
      let node;

      // First, try to find the table of contents. If so, take the next child
      let toc_list = html.getElementById('revision').getElementsByClassName('maruku_toc');
      console.log(toc_list)
      if (toc_list.length > 0) {
        node = toc_list[0].nextSibling;
      } else {
      // Otherwise, just loop through the nodes from the beginning
        node = html.getElementById('revision').childNodes[0];
      }
      console.log(html.getElementById('revision').childNodes);

      // Skip over blockquotes, #text (line breaks), and right-hand-side menus
      while(node && (
            node.className == 'rightHandSide'
              || node.nodeName == '#text'
              || node.tagName == 'blockquote')) {
        node = node.nextSibling;
      }
      console.log('node', node)
      let nodes_list = [];
      if (node) {
        nodes_list = [node];
        node = node.nextSibling;
        while(node && node.tagName !== 'h1' && node.tagName !== 'h2') {
          nodes_list.push(node);
          node = node.nextSibling;
        }
      }
      if (nodes_list.length < 2) {
        alert('Something went wrong: nlab page + ' + url + ' has no content') ;
      } else {
        document.getElementById('nlab_spinner').style.display = 'none';
        display_nlab_page({'title': title, 'url': url, 'contents': nodes_list})
        document.getElementById('nlab_posts').style.opacity = 1.0;

        MathJax.Hub.Queue(["Typeset", MathJax.Hub, "nlab"]);
      }
    }
  }
  getHTML(url, {callback:process_page});
}

function load_nlab() {
  let pages = Object.keys(nlab_pages);
  let rand_page = pages[Math.floor(Math.random() * pages.length)];
  let url = nlab_pages[rand_page];
  load_nlab_page(rand_page, url);
}

function load_posts() {
  load_hackernews(20);
  load_subreddit('AskReddit', 20);
  load_nlab();
}
