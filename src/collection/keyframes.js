define(['src/app', 'src/model/keyframe'], function (app, KeyframeModel) {

  return Backbone.Collection.extend({

    'model': KeyframeModel

    ,'initialize': function (models, opts) {
      _.extend(this, opts);

      this.on('add', _.bind(function (model) {
        this.owner.crosshairsView.addCrosshairView(model);
        this.owner.keyframeFormsView.addKeyframeView(model);
      }, this));
    }

    ,'comparator': function (keyframeModel) {
      return keyframeModel.get('millisecond');
    }

    ,'updateModelFormViews': function () {
      if (!this.models[0].keyframeForm) {
        return;
      }

      this.each(function (model) {
        model.keyframeForm.render();
      });
    }

    ,'updateModelCrosshairViews': function () {
      if (!this.models[0].crosshairView) {
        return;
      }

      this.each(function (model) {
        model.crosshairView.render();
      });
    }

  });
});
