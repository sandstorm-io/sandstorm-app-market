var genres = [
  {
    name: 'all',
    route: '/',
    active: true
  },
  {
    name: 'popular',
    route: '/'
  },
  {
    name: 'productivity',
    route: '/'
  },
  {
    name: 'publishing',
    route: '/'
  },
  {
    name: 'games',
    route: '/'
  },
  {
    name: 'email',
    route: '/'
  },
  {
    name: 'science',
    route: '/'
  },
  {
    name: 'media',
    route: '/'
  },
  {
    name: 'social',
    route: '/'
  }
];

Template.Topbar.helpers({
  genres: function() {
    return genres;
  },
  pathFor: function() {
    return this.route;
  }
});
