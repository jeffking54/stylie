define(['src/app', 'src/model/keyframe'], function (app, KeyframeModel) {

  return Backbone.Collection.extend({

    'model': KeyframeModel

    ,'initialize': function (models, opts) {

      this.on('add', function (model) {
        model.owner.crosshairsView.addCrosshairView(model);
        model.owner.keyframeFormsView.addKeyframeView(model);
      });
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
