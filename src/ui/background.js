define(['src/app', 'src/constants'], function (app, constant) {
  return Backbone.View.extend({

    'initialize': function (opts) {
      _.extend(this, opts);
      this.context = this.$el[0].getContext('2d');
      this.resize({
        'height': opts.height
        ,'width': opts.width
      });

      subscribe(constant.PATH_CHANGED,
          _.bind(this.update, this));
    }

    ,'resize': function (dims) {
      _.each(['height', 'width'], function (dim) {
        if (dim in dims) {
          var tweakObj = {};
          tweakObj[dim] = dims[dim];
          this.$el
            .css(tweakObj)
            .attr(tweakObj);
        }
      }, this);
    }

    ,'generatePathPoints': function (easeX, easeY) {
      var keyframe1 =
          app.collection.actors.getCurrent().getAttrsForKeyframe(0);
      var keyframe2 =
          app.collection.actors.getCurrent().getAttrsForKeyframe(1);
      var x1 = keyframe1.x;
      var y1 = keyframe1.y;
      var x2 = keyframe2.x;
      var y2 = keyframe2.y;

      var points = [];
      var from = {
          'x': x1
          ,'y': y1
        };
      var to = {
          'x': x2
          ,'y': y2
        };
      var easing = {
        'x': easeX
        ,'y': easeY
      };
      var i, point;
      for (i = 0; i <= constant.RENDER_GRANULARITY; i++) {
        point = Tweenable.interpolate(
            from, to, (1 / constant.RENDER_GRANULARITY) * i, easing);
        points.push(point);
      }

      return points;
    }

    ,'generatePathPrerender': function (easeX, easeY, useDimColor) {
      app.config.prerenderedPath = document.createElement('canvas');
      app.config.prerenderedPath.width =
          app.view.canvas.$canvasBG.width();
      app.config.prerenderedPath.height =
          app.view.canvas.$canvasBG.height();
      var ctx = app.config.prerenderedPath.ctx =
          app.config.prerenderedPath.getContext('2d');
      var points = this.generatePathPoints.apply(this, arguments);

      var previousPoint;
      ctx.beginPath();
      _.each(points, function (point) {
        if (previousPoint) {
          ctx.lineTo(point.x, point.y);
        } else {
          ctx.moveTo(point.x, point.y);
        }

        previousPoint = point;
      });
      ctx.lineWidth = 1;
      // TODO: These need to be constants!
      var strokeColor = useDimColor
          ? 'rgba(255,176,0,.5)'
          : 'rgb(255,176,0)';
      ctx.strokeStyle = strokeColor;
      ctx.stroke();
      ctx.closePath();
    }

    ,'update': function (useDimColor) {
      this.generatePathPrerender(app.view.selectX.$el.val(),
          app.view.selectY.$el.val(), useDimColor);

      this.$el[0].width = this.$el.width();
      if (app.config.isPathShowing) {
        this.context.drawImage(app.config.prerenderedPath, 0, 0);
      }
    }

  });
});
