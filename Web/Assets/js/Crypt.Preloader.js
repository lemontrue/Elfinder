var Crypt;

Crypt = Crypt || {};

Crypt.Preloader = {
  nodes: [],
  FadeDuration: 600,
  Block: function($el) {
    var $preloaderElement, $preloaderLayout, containerHeight;
    $el = !!$el ? $el : $('#Layout');
    if (!$el.length) {
      return false;
    }
    Crypt.Preloader.UnBlock($el, {
      fast: true
    });
    Crypt.Preloader._addNodeToStack($el, 'container');
    $preloaderLayout = $('<div>').addClass('el-preloader-layout js-preloader-layout');
    $preloaderElement = $('<div>').addClass('el-preloader-large preloader js-preloader');
    containerHeight = $el.outerHeight();
    if (containerHeight >= 100) {
      $el.append($preloaderLayout).append($preloaderElement);
    }
  },
  UnBlock: function($el, options) {
    var $preloaderElement, $preloaderLayout;
    $el = !!$el ? $el : $('#Layout');
    options = options || {};
    if (!$el.length) {
      return false;
    }
    $preloaderElement = $el.find('.js-preloader');
    $preloaderLayout = $el.find('.js-preloader-layout');
    if ($preloaderElement.length || $preloaderLayout.length) {
      $preloaderElement.fadeOut(0, function() {
        $(this).remove();
      });
      $preloaderLayout.fadeOut(0, function() {
        $(this).remove();
      });
    }
    this._removeNodeFromStack($el);
  },
  UnBlockAll: function() {
    $.each(Crypt.Preloader.nodes, function(index, item) {
      if (!_.isUndefined(item)) {
        switch (item.type) {
          case 'ui':
            Crypt.Preloader.UnBlockUI({
              fast: true
            });
            break;
          case 'container':
          case 'mini':
            Crypt.Preloader.UnBlock(item.node, {
              fast: true
            });
        }
      }
    });
  },
  _addNodeToStack: function($node, blockType) {
    Crypt.Preloader.nodes.push({
      type: blockType,
      node: !!$node ? $node : null
    });
  },
  _removeNodeFromStack: function($node) {
    var key;
    key = null;
    $node = !!$node ? $node : null;
    $.each(Crypt.Preloader.nodes, function(index, item) {
      if (item.node === $node) {
        key = index;
        return;
      }
    });
    Crypt.Preloader.nodes.splice(key, 1);
  }
};
