/*! FC2 Blog Designer's Link - v0.1.0 - 2012-09-09
* Copyright (c) 2012 moi; Licensed MIT, GPL */

(function() {
  var Pagination, UI;

  UI = (function() {
    var def, getData, getPage, getPagination, infiniteScroll, load, render;

    def = {
      'hits': 20,
      'template': '#template-list',
      'target': '#list',
      'src': 'js/site.json'
    };

    function UI(opt) {
      var self, target;
      this.opt = $.extend(def, opt);
      self = this;
      getData(this.opt.src).then(function(data) {
        self.site = data.site;
        self.totalPage = Math.ceil(data.site.length / self.opt.hits);
        self.page = getPage.apply(self);
        render(self.opt.target, self.opt.template, load.apply(self, [self.page]));
        return $('.pagination').append(getPagination.apply(self));
      }, function() {});
      target = $(this.opt.target).masonry({
        'itemSelector': '.box',
        'columnWidth': 300,
        'gutterWidth': 20
      }).on('click', '.twitter', function(event) {
        event.preventDefault();
        event.stopPropagation();
        return window.open($(this).data('href'));
      });
      infiniteScroll.apply(this);
      $(window).hashchange(function() {
        self.opt.hits = 20;
        self.page = getPage.apply(self);
        target.empty().masonry('reload');
        render(self.opt.target, self.opt.template, load.apply(self, [self.page]));
        return $('.pagination').empty().append(getPagination.apply(self));
      });
    }

    getPagination = function() {
      return (new Pagination()).get({
        'total': this.totalPage,
        'current': this.page
      });
    };

    getPage = function() {
      var hash;
      hash = location.hash.split('/');
      if (hash.length < 2) {
        return 1;
      }
      if (hash[1] === 'all') {
        this.opt.hits = this.site.length;
        return 1;
      }
      return hash[1] - 0;
    };

    getData = function(src) {
      var dfd;
      dfd = new $.Deferred();
      $.ajax({
        'url': src + '?callback=?',
        'dataType': 'jsonp',
        'complete': function(data) {
          var res;
          res = data.responseText;
          return dfd.resolve(JSON ? JSON.parse(res) : eval(res));
        },
        'fail': function() {
          return dfd.reject();
        }
      });
      return dfd.promise();
    };

    load = function(page) {
      var first, hits, last;
      hits = this.opt.hits;
      first = (page - 1) * hits;
      last = first + hits;
      if (last >= this.site.length) {
        last = this.site.length - 1;
      }
      return this.site.slice(first, last);
    };

    render = function(target, tmp, items) {
      render.target = render.target || $(target);
      items = $($(tmp).render(items));
      render.target.append(items);
      return items.imagesLoaded(function() {
        return render.target.masonry('appended', items);
      });
    };

    infiniteScroll = function() {
      var inf, self;
      self = this;
      return $(window).on('scroll', function() {
        var scrollHeight, scrollPosition, win;
        win = $(window);
        scrollHeight = $(document).height();
        scrollPosition = win.height() + win.scrollTop();
        if ((scrollHeight - scrollPosition) / scrollHeight <= 0.1) {
          return win.trigger('bottom');
        }
      }).on('bottom', inf = function() {
        inf.i = inf.i || 0;
        if (inf.i) {
          return;
        }
        inf.i = 1;
        setTimeout(function() {
          return inf.i = 0;
        }, 1000);
        return render(self.opt.target, self.opt.template, load.apply(self, [++self.page]));
      });
    };

    return UI;

  })();

  Pagination = (function() {
    var def;

    function Pagination() {}

    def = {
      'range': 9,
      'prev': '\u00ab',
      'next': '\u00bb'
    };

    Pagination.prototype.get = function(opt) {
      var current, divider, half, k, list, max, min, next, prev, range, skip_next, skip_prev, total, ul, _i;
      this.opt = $.extend(def, opt);
      total = this.opt.total;
      range = this.opt.range;
      current = this.opt.current;
      if (total < 1) {
        total = 1;
      }
      if (current < 1) {
        current = 1;
      }
      if (range > total) {
        range = total;
      }
      half = Math.ceil(range / 2);
      if (current - half < 0) {
        min = 1;
        max = range;
      } else if (current + half >= total) {
        min = total - range + 1;
        max = total;
      } else {
        min = current - half + 1;
        max = current + half;
      }
      ul = $('<ul/>');
      for (k = _i = min; min <= max ? _i <= max : _i >= max; k = min <= max ? ++_i : --_i) {
        list = $('<li>').appendTo(ul);
        if (k === current) {
          list.addClass('active');
        }
        $('<a>').attr('href', '#!/' + k).text(k).appendTo(list);
      }
      divider = $('<li class="disabled"><a href="#">...</a></li>');
      if (min > 1) {
        divider.prependTo(ul);
        skip_prev = $('<li>').prependTo(ul);
        $('<a>').attr({
          'href': '#!/1'
        }).text('1').appendTo(skip_prev);
      }
      if (max < total) {
        divider.clone().appendTo(ul);
        skip_next = $('<li>').appendTo(ul);
        $('<a>').attr('href', '#!/' + total).text(total).appendTo(skip_next);
      }
      prev = $('<li class="prev" />');
      next = $('<li class="next" />');
      $('<a />').attr('href', '#!/' + (current - 1)).text(this.opt.prev).appendTo(prev);
      $('<a />').attr('href', '#!/' + (current + 1)).text(this.opt.next).appendTo(next);
      if (current <= 1) {
        prev.addClass('disabled');
      }
      if (current >= total) {
        next.addClass('disabled');
      }
      ul.prepend(prev).append(next);
      return ul;
    };

    return Pagination;

  })();

  $(function() {
    return new UI();
  });

}).call(this);
