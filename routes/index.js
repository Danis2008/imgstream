
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Latest images from imgur.com' });
};
