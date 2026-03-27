/*! RESOURCE: /scripts/heisenberg/bootstrap/affix.js */
+function ($) {
  'use strict';
  var Affix = function (element, options) {
    this.options = $.extend({}, Affix.DEFAULTS, options)
    var target = this.options.target === Affix.DEFAULTS.target ? $(this.options.target) : $(document).find(this.options.target === '#' ? [] : this.options.target)
    this.$target = target
      .on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this))
      .on('click.bs.affix.data-api',  $.proxy(this.checkPositionWithEventLoop, this))
    this.$element     = $(element)
    this.affixed      =
    this.unpin        =
    this.pinnedOffset = null
    this.checkPosition()
  }
  Affix.VERSION  = '3.2.0'
  Affix.RESET    = 'affix affix-top affix-bottom'
  Affix.DEFAULTS = {
    offset: 0,
    target: window
  }
  Affix.prototype.getPinnedOffset = function () {
    if (this.pinnedOffset) return this.pinnedOffset
    this.$element.removeClass(Affix.RESET).addClass('affix')
    var scrollTop = this.$target.scrollTop()
    var position  = this.$element.offset()
    return (this.pinnedOffset = position.top - scrollTop)
  }
  Affix.prototype.checkPositionWithEventLoop = function () {
    setTimeout($.proxy(this.checkPosition, this), 1)
  }
  Affix.prototype.checkPosition = function () {
    if (!this.$element.is(':visible')) return
    var scrollHeight = $(document).height()
    var scrollTop    = this.$target.scrollTop()
    var position     = this.$element.offset()
    var offset       = this.options.offset
    var offsetTop    = offset.top
    var offsetBottom = offset.bottom
    if (typeof offset != 'object')         offsetBottom = offsetTop = offset
    if (typeof offsetTop == 'function')    offsetTop    = offset.top(this.$element)
    if (typeof offsetBottom == 'function') offsetBottom = offset.bottom(this.$element)
    var affix = this.unpin   != null && (scrollTop + this.unpin <= position.top) ? false :
                offsetBottom != null && (position.top + this.$element.height() >= scrollHeight - offsetBottom) ? 'bottom' :
                offsetTop    != null && (scrollTop <= offsetTop) ? 'top' : false
    if (this.affixed === affix) return
    if (this.unpin != null) this.$element.css('top', '')
    var affixType = 'affix' + (affix ? '-' + affix : '')
    var e         = $.Event(affixType + '.bs.affix')
    this.$element.trigger(e)
    if (e.isDefaultPrevented()) return
    this.affixed = affix
    this.unpin = affix == 'bottom' ? this.getPinnedOffset() : null
    this.$element
      .removeClass(Affix.RESET)
      .addClass(affixType)
      .trigger($.Event(affixType.replace('affix', 'affixed')))
    if (affix == 'bottom') {
      this.$element.offset({
        top: scrollHeight - this.$element.height() - offsetBottom
      })
    }
  }
  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.affix')
      var options = typeof option == 'object' && option
      if (!data) $this.data('bs.affix', (data = new Affix(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }
  var old = $.fn.affix
  $.fn.affix             = Plugin
  $.fn.affix.Constructor = Affix
  $.fn.affix.noConflict = function () {
    $.fn.affix = old
    return this
  }
  $(window).on('load', function () {
    $('[data-spy="affix"]').each(function () {
      var $spy = $(this)
      var data = $spy.data()
      data.offset = data.offset || {}
      if (data.offsetBottom) data.offset.bottom = data.offsetBottom
      if (data.offsetTop)    data.offset.top    = data.offsetTop
      Plugin.call($spy, data)
    })
  })
}(jQuery);
;
/*! RESOURCE: /scripts/heisenberg/bootstrap/alert.js */
+function ($) {
  'use strict';
  var dismiss = '[data-dismiss="alert"]'
  var Alert   = function (el) {
    $(el).on('click', dismiss, this.close)
  }
  Alert.VERSION = '3.2.0'
  Alert.prototype.close = function (e) {
    var $this    = $(this)
    var selector = $this.attr('data-target')
    if (!selector) {
      selector = $this.attr('href')
selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '')
    }
    selector = selector === '#' ? [] : selector
    var $parent = $(document).find(selector)
    if (e) e.preventDefault()
    if (!$parent.length) {
      $parent = $this.hasClass('alert') ? $this : $this.parent()
    }
    $parent.trigger(e = $.Event('close.bs.alert'))
    if (e.isDefaultPrevented()) return
    $parent.removeClass('in')
    function removeElement() {
      $parent.detach().trigger('closed.bs.alert').remove()
    }
    $.support.transition && $parent.hasClass('fade') ?
      $parent
        .one('bsTransitionEnd', removeElement)
        .emulateTransitionEnd(150) :
      removeElement()
  }
  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.alert')
      if (!data) $this.data('bs.alert', (data = new Alert(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }
  var old = $.fn.alert
  $.fn.alert             = Plugin
  $.fn.alert.Constructor = Alert
  $.fn.alert.noConflict = function () {
    $.fn.alert = old
    return this
  }
  $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close)
}(jQuery);
;
/*! RESOURCE: /scripts/heisenberg/bootstrap/button.js */
+function ($) {
  'use strict';
  var Button = function (element, options) {
    this.$element  = $(element)
    this.options   = $.extend({}, Button.DEFAULTS, options)
    this.isLoading = false
  }
  Button.VERSION  = '3.2.0'
  Button.DEFAULTS = {
    loadingText: 'loading...'
  }
  Button.prototype.setState = function (state) {
    var d    = 'disabled'
    var $el  = this.$element
    var val  = $el.is('input') ? 'val' : 'html'
    var data = $el.data()
    state = state + 'Text'
    if (data.resetText == null) $el.data('resetText', $el[val]())
    $el[val](data[state] == null ? this.options[state] : data[state])
    setTimeout($.proxy(function () {
      if (state == 'loadingText') {
        this.isLoading = true
        $el.addClass(d).attr(d, d)
      } else if (this.isLoading) {
        this.isLoading = false
        $el.removeClass(d).removeAttr(d)
      }
    }, this), 0)
  }
  Button.prototype.toggle = function () {
    var changed = true
    var $parent = this.$element.closest('[data-toggle="buttons"]')
    if ($parent.length) {
      var $input = this.$element.find('input')
      if ($input.prop('type') == 'radio') {
        if ($input.prop('checked') && this.$element.hasClass('active')) changed = false
        else $parent.find('.active').removeClass('active')
      }
      if (changed) $input.prop('checked', !this.$element.hasClass('active')).trigger('change')
    }
    if (changed) this.$element.toggleClass('active')
  }
  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.button')
      var options = typeof option == 'object' && option
      if (!data) $this.data('bs.button', (data = new Button(this, options)))
      if (option == 'toggle') data.toggle()
      else if (option) data.setState(option)
    })
  }
  var old = $.fn.button
  $.fn.button             = Plugin
  $.fn.button.Constructor = Button
  $.fn.button.noConflict = function () {
    $.fn.button = old
    return this
  }
  $(document).on('click.bs.button.data-api', '[data-toggle^="button"]', function (e) {
    var $btn = $(e.target)
    if (!$btn.hasClass('btn')) $btn = $btn.closest('.btn')
    Plugin.call($btn, 'toggle')
    e.preventDefault()
  })
}(jQuery);
;
/*! RESOURCE: /scripts/heisenberg/bootstrap/carousel.js */
+function ($) {
  'use strict';
  var Carousel = function (element, options) {
    this.$element    = $(element).on('keydown.bs.carousel', $.proxy(this.keydown, this))
    this.$indicators = this.$element.find('.carousel-indicators')
    this.options     = options
    this.paused      =
    this.sliding     =
    this.interval    =
    this.$active     =
    this.$items      = null
    this.options.pause == 'hover' && this.$element
      .on('mouseenter.bs.carousel', $.proxy(this.pause, this))
      .on('mouseleave.bs.carousel', $.proxy(this.cycle, this))
  }
  Carousel.VERSION  = '3.2.0'
  Carousel.DEFAULTS = {
    interval: 5000,
    pause: 'hover',
    wrap: true
  }
  Carousel.prototype.keydown = function (e) {
    switch (e.which) {
      case 37: this.prev(); break
      case 39: this.next(); break
      default: return
    }
    e.preventDefault()
  }
  Carousel.prototype.cycle = function (e) {
    e || (this.paused = false)
    this.interval && clearInterval(this.interval)
    this.options.interval
      && !this.paused
      && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))
    return this
  }
  Carousel.prototype.getItemIndex = function (item) {
    this.$items = item.parent().children('.item')
    return this.$items.index(item || this.$active)
  }
  Carousel.prototype.to = function (pos) {
    var that        = this
    var activeIndex = this.getItemIndex(this.$active = this.$element.find('.item.active'))
    if (pos > (this.$items.length - 1) || pos < 0) return
if (this.sliding)       return this.$element.one('slid.bs.carousel', function () { that.to(pos) })
    if (activeIndex == pos) return this.pause().cycle()
    return this.slide(pos > activeIndex ? 'next' : 'prev', $(this.$items[pos]))
  }
  Carousel.prototype.pause = function (e) {
    e || (this.paused = true)
    if (this.$element.find('.next, .prev').length && $.support.transition) {
      this.$element.trigger($.support.transition.end)
      this.cycle(true)
    }
    this.interval = clearInterval(this.interval)
    return this
  }
  Carousel.prototype.next = function () {
    if (this.sliding) return
    return this.slide('next')
  }
  Carousel.prototype.prev = function () {
    if (this.sliding) return
    return this.slide('prev')
  }
  Carousel.prototype.slide = function (type, next) {
    var $active   = this.$element.find('.item.active')
    var $next     = next || $active[type]()
    var isCycling = this.interval
    var direction = type == 'next' ? 'left' : 'right'
    var fallback  = type == 'next' ? 'first' : 'last'
    var that      = this
    if (!$next.length) {
      if (!this.options.wrap) return
      $next = this.$element.find('.item')[fallback]()
    }
    if ($next.hasClass('active')) return (this.sliding = false)
    var relatedTarget = $next[0]
    var slideEvent = $.Event('slide.bs.carousel', {
      relatedTarget: relatedTarget,
      direction: direction
    })
    this.$element.trigger(slideEvent)
    if (slideEvent.isDefaultPrevented()) return
    this.sliding = true
    isCycling && this.pause()
    if (this.$indicators.length) {
      this.$indicators.find('.active').removeClass('active')
      var $nextIndicator = $(this.$indicators.children()[this.getItemIndex($next)])
      $nextIndicator && $nextIndicator.addClass('active')
    }
var slidEvent = $.Event('slid.bs.carousel', { relatedTarget: relatedTarget, direction: direction })
    if ($.support.transition && this.$element.hasClass('slide')) {
      $next.addClass(type)
$next[0].offsetWidth
      $active.addClass(direction)
      $next.addClass(direction)
      $active
        .one('bsTransitionEnd', function () {
          $next.removeClass([type, direction].join(' ')).addClass('active')
          $active.removeClass(['active', direction].join(' '))
          that.sliding = false
          setTimeout(function () {
            that.$element.trigger(slidEvent)
          }, 0)
        })
        .emulateTransitionEnd($active.css('transition-duration').slice(0, -1) * 1000)
    } else {
      $active.removeClass('active')
      $next.addClass('active')
      this.sliding = false
      this.$element.trigger(slidEvent)
    }
    isCycling && this.cycle()
    return this
  }
  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.carousel')
      var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option)
      var action  = typeof option == 'string' ? option : options.slide
      if (!data) $this.data('bs.carousel', (data = new Carousel(this, options)))
      if (typeof option == 'number') data.to(option)
      else if (action) data[action]()
      else if (options.interval) data.pause().cycle()
    })
  }
  var old = $.fn.carousel
  $.fn.carousel             = Plugin
  $.fn.carousel.Constructor = Carousel
  $.fn.carousel.noConflict = function () {
    $.fn.carousel = old
    return this
  }
  $(document).on('click.bs.carousel.data-api', '[data-slide], [data-slide-to]', function (e) {
    var $this   = $(this)
    var href    = $this.attr('href')
    if (href) {
href = href.replace(/.*(?=#[^\s]+$)/, '')
    }
    var target  = $this.attr('data-target') || href
    target = target === '#' ? [] : target
    var $target = $(document).find(target)
    if (!$target.hasClass('carousel')) return
    var options = $.extend({}, $target.data(), $this.data())
    var slideIndex = $this.attr('data-slide-to')
    if (slideIndex) options.interval = false
    Plugin.call($target, options)
    if (slideIndex) {
      $target.data('bs.carousel').to(slideIndex)
    }
    e.preventDefault()
  })
  $(window).on('load', function () {
    $('[data-ride="carousel"]').each(function () {
      var $carousel = $(this)
      Plugin.call($carousel, $carousel.data())
    })
  })
}(jQuery);
;
/*! RESOURCE: /scripts/heisenberg/bootstrap/collapse.js */
+function ($) {
  'use strict';
  var Collapse = function (element, options) {
    this.$element      = $(element)
    this.options       = $.extend({}, Collapse.DEFAULTS, options)
    this.transitioning = null
    if (this.options.parent) this.$parent = $(document).find(this.options.parent === '#' ? [] : this.options.parent)
    if (this.options.toggle) this.toggle()
  }
  Collapse.VERSION  = '3.2.0'
  Collapse.DEFAULTS = {
    toggle: true
  }
  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('width')
    return hasWidth ? 'width' : 'height'
  }
  Collapse.prototype.show = function () {
    if (this.transitioning || this.$element.hasClass('in')) return
    var startEvent = $.Event('show.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return
    var actives = this.$parent && this.$parent.find('> .panel > .in')
    if (actives && actives.length) {
      var hasData = actives.data('bs.collapse')
      if (hasData && hasData.transitioning) return
      Plugin.call(actives, 'hide')
      hasData || actives.data('bs.collapse', null)
    }
    var dimension = this.dimension()
    this.$element
      .removeClass('collapse')
      .addClass('collapsing')[dimension](0)
    this.transitioning = 1
    var complete = function () {
      this.$element
        .removeClass('collapsing')
        .addClass('collapse in')[dimension]('')
      this.transitioning = 0
      this.$element
        .trigger('shown.bs.collapse')
    }
    if (!$.support.transition) return complete.call(this)
    var scrollSize = $.camelCase(['scroll', dimension].join('-'))
    this.$element
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(350)[dimension](this.$element[0][scrollSize])
  }
  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('in')) return
    var startEvent = $.Event('hide.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return
    var dimension = this.dimension()
    this.$element[dimension](this.$element[dimension]())[0].offsetHeight
    this.$element
      .addClass('collapsing')
      .removeClass('collapse')
      .removeClass('in')
    this.transitioning = 1
    var complete = function () {
      this.transitioning = 0
      this.$element
        .trigger('hidden.bs.collapse')
        .removeClass('collapsing')
        .addClass('collapse')
    }
    if (!$.support.transition) return complete.call(this)
    this.$element
      [dimension](0)
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(350)
  }
  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('in') ? 'hide' : 'show']()
  }
  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.collapse')
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)
      if (!data && options.toggle && option == 'show') option = !option
      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }
  var old = $.fn.collapse
  $.fn.collapse             = Plugin
  $.fn.collapse.Constructor = Collapse
  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }
  $(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function (e) {
    var href
    var $this   = $(this)
    var target  = $this.attr('data-target')
        || e.preventDefault()
|| (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')
    target = target === '#' ? [] : target
    var $target = $(document).find(target)
    var data    = $target.data('bs.collapse')
    var option  = data ? 'toggle' : $this.data()
    var parent  = $this.attr('data-parent')
    var $parent = parent && $(parent)
    if (!data || !data.transitioning) {
      if ($parent) $parent.find('[data-toggle="collapse"][data-parent="' + parent + '"]').not($this).addClass('collapsed')
      $this[$target.hasClass('in') ? 'addClass' : 'removeClass']('collapsed')
    }
    Plugin.call($target, option)
  })
}(jQuery);
;
/*! RESOURCE: /scripts/heisenberg/bootstrap/dropdown.js */
+function ($) {
  'use strict';
  var backdrop = '.dropdown-backdrop'
  var toggle   = '[data-toggle="dropdown"]'
  var Dropdown = function (element) {
    $(element).on('click.bs.dropdown', this.toggle)
  }
  Dropdown.VERSION = '3.2.0'
  Dropdown.prototype.toggle = function (e) {
    var $this = $(this)
    if ($this.is('.disabled, :disabled')) return
    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')
    clearMenus()
    if (!isActive) {
      if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
$('<div class="dropdown-backdrop"/>').insertAfter($(this)).on('click', clearMenus)
      }
      var relatedTarget = { relatedTarget: this }
      $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget))
      if (e.isDefaultPrevented()) return
      $this
        .trigger('focus')
        .attr('aria-expanded', 'true')
      $parent
        .toggleClass('open')
        .trigger('shown.bs.dropdown', relatedTarget)
    }
    return false
  }
  Dropdown.prototype.keydown = function (e) {
if (!/(38|40|27|32|9)/.test(e.keyCode) || /input|textarea/i.test(e.target.tagName)) return
    if (e.keyCode == 9) {
      clearMenus()
      return
    }
    var $this = $(this)
    e.preventDefault()
    e.stopPropagation()
    if ($this.is('.disabled, :disabled')) return
    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')
    if ((!isActive && e.keyCode != 27) || (isActive && e.keyCode == 27)) {
      if (e.which == 27) $parent.find(toggle).trigger('focus')
        return $this.trigger('click');
    }
    var desc = ' li:not(.divider):visible a'
    var $items = $parent.find('.dropdown-menu' + desc)
    if (!$items.length) return
    var index = $items.index($items.filter(':focus'))
if (e.keyCode == 38) {
      if(index > 0) index--
      else if(index == 0) index = $items.length - 1
    }
if (e.keyCode == 40) {
      if(index < $items.length - 1) index++
      else if(index == $items.length - 1) index = 0
    }
    if (!~index)    index = 0
    $items.eq(index).trigger('focus')
  }
  function clearMenus(e) {
    if (e && e.which === 3) return
    $(backdrop).remove()
    $(toggle).each(function () {
      var $this         = $(this)
      var $parent       = getParent($this)
      var relatedTarget = { relatedTarget: this }
      if (!$parent.hasClass('open')) return
      $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget))
      if (e.isDefaultPrevented()) return
      $this.attr('aria-expanded', 'false')
      $parent.removeClass('open').trigger('hidden.bs.dropdown', relatedTarget)
    })
  }
  function getParent($this) {
    var selector = $this.attr('data-target')
    if (!selector) {
      selector = $this.attr('href')
selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '')
    }
    selector = selector === '#' ? [] : selector
    var $parent = selector && $(document).find(selector)
    return $parent && $parent.length ? $parent : $this.parent()
  }
  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.dropdown')
      if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }
  var old = $.fn.dropdown
  $.fn.dropdown             = Plugin
  $.fn.dropdown.Constructor = Dropdown
  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old
    return this
  }
  $(document)
    .on('click.bs.dropdown.data-api', clearMenus)
    .on('click.bs.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
    .on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle)
    .on('keydown.bs.dropdown.data-api', toggle, Dropdown.prototype.keydown)
    .on('keydown.bs.dropdown.data-api', '.dropdown-menu', Dropdown.prototype.keydown)
}(jQuery);
;
/*! RESOURCE: /scripts/heisenberg/bootstrap/tooltip.js */
+function ($) {
  'use strict';
  var DISALLOWED_ATTRIBUTES = ['sanitize', 'whiteList', 'sanitizeFn']
  var uriAttrs = [
    'background',
    'cite',
    'href',
    'itemtype',
    'longdesc',
    'poster',
    'src',
    'xlink:href'
  ]
var ARIA_ATTRIBUTE_PATTERN = /^aria-[\w-]*$/i
  var DefaultWhitelist = {
    '*': ['class', 'dir', 'id', 'lang', 'role', ARIA_ATTRIBUTE_PATTERN],
    a: ['target', 'href', 'title', 'rel'],
    area: [],
    b: [],
    br: [],
    col: [],
    code: [],
    div: [],
    em: [],
    hr: [],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
    i: [],
    img: ['src', 'alt', 'title', 'width', 'height'],
    li: [],
    ol: [],
    p: [],
    pre: [],
    s: [],
    small: [],
    span: [],
    sub: [],
    sup: [],
    strong: [],
    u: [],
    ul: []
  }
var SAFE_URL_PATTERN = /^(?:(?:https?|mailto|ftp|tel|file):|[^&:/?#]*(?:[/?#]|$))/gi
var DATA_URL_PATTERN = /^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,[a-z0-9+/]+=*$/i
  function allowedAttribute(attr, allowedAttributeList) {
    var attrName = attr.nodeName.toLowerCase()
    if ($.inArray(attrName, allowedAttributeList) !== -1) {
      if ($.inArray(attrName, uriAttrs) !== -1) {
        return Boolean(attr.nodeValue.match(SAFE_URL_PATTERN) || attr.nodeValue.match(DATA_URL_PATTERN))
      }
      return true
    }
    var regExp = $(allowedAttributeList).filter(function (index, value) {
      return value instanceof RegExp
    })
    for (var i = 0, l = regExp.length; i < l; i++) {
      if (attrName.match(regExp[i])) {
        return true
      }
    }
    return false
  }
  function sanitizeHtml(unsafeHtml, whiteList, sanitizeFn) {
    if (unsafeHtml.length === 0) {
      return unsafeHtml
    }
    if (sanitizeFn && typeof sanitizeFn === 'function') {
      return sanitizeFn(unsafeHtml)
    }
    if (!document.implementation || !document.implementation.createHTMLDocument) {
      return unsafeHtml
    }
    var createdDocument = document.implementation.createHTMLDocument('sanitization')
    createdDocument.body.innerHTML = unsafeHtml
    var whitelistKeys = $.map(whiteList, function (el, i) { return i })
    var elements = $(createdDocument.body).find('*')
    for (var i = 0, len = elements.length; i < len; i++) {
      var el = elements[i]
      var elName = el.nodeName.toLowerCase()
      if ($.inArray(elName, whitelistKeys) === -1) {
        el.parentNode.removeChild(el)
        continue
      }
      var attributeList = $.map(el.attributes, function (el) { return el })
      var whitelistedAttributes = [].concat(whiteList['*'] || [], whiteList[elName] || [])
      for (var j = 0, len2 = attributeList.length; j < len2; j++) {
        if (!allowedAttribute(attributeList[j], whitelistedAttributes)) {
          el.removeAttribute(attributeList[j].nodeName)
        }
      }
    }
    return createdDocument.body.innerHTML
  }
  var Tooltip = function (element, options) {
    this.type       =
    this.options    =
    this.enabled    =
    this.timeout    =
    this.hoverState =
    this.orphanCheck=
    this.$element   = null
    this.init('tooltip', element, options)
  }
  Tooltip.VERSION  = '3.2.0'
  Tooltip.DEFAULTS = {
    animation: true,
    placement: 'top',
    selector: false,
template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    container: false,
    viewport: {
      selector: 'body',
      padding: 0
    },
    sanitize : false,
    sanitizeFn : null,
    whiteList : DefaultWhitelist
  }
  Tooltip.prototype.init = function (type, element, options) {
    this.enabled   = true
    this.type      = type
    this.$element  = $(element)
    this.options   = this.getOptions(options)
    var viewport = this.options.viewport && (this.options.viewport.selector || this.options.viewport)
    viewport = viewport === '#' ? [] : viewport;
    this.$viewport = this.options.viewport && $(document).find(viewport)
    var triggers = this.options.trigger.split(' ')
    for (var i = triggers.length; i--;) {
      var trigger = triggers[i]
      if (trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
      } else if (trigger != 'manual') {
        var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin'
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout'
        this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
      }
    }
    this.options.selector ?
      (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
      this.fixTitle()
  }
  Tooltip.prototype.getDefaults = function () {
    return Tooltip.DEFAULTS
  }
  Tooltip.prototype.getOptions = function (options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options)
    var dataAttributes = this.$element.data()
    for (var dataAttr in dataAttributes) {
      if (dataAttributes.hasOwnProperty(dataAttr) && $.inArray(dataAttr, DISALLOWED_ATTRIBUTES) !== -1) {
        delete dataAttributes[dataAttr]
      }
    }
    options = $.extend({}, this.getDefaults(), dataAttributes, options)
    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay,
        hide: options.delay
      }
    }
    if (options.sanitize) {
      options.template = sanitizeHtml(options.template, options.whiteList, options.sanitizeFn)
    }
    return options
  }
  Tooltip.prototype.getDelegateOptions = function () {
    var options  = {}
    var defaults = this.getDefaults()
    this._options && $.each(this._options, function (key, value) {
      if (defaults[key] != value) options[key] = value
    })
    return options
  }
  Tooltip.prototype.clearOrphanCheckInterval = function(self) {
    if (typeof self.orphanCheck !== 'number')
      return;
    clearInterval(self.orphanCheck);
    self.orphanCheck = undefined;
  }
  Tooltip.prototype.addOrphanCheck = function(self) {
    this.clearOrphanCheckInterval(self);
    self.orphanCheck = setInterval(function () {
      if (self.$element && !self.$element.is(':visible')) {
        this.clearOrphanCheckInterval(self);
        self.hide();
      }
    }.bind(this), 1000);
  }
  Tooltip.prototype.enter = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)
    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }
    clearTimeout(self.timeout)
    this.clearOrphanCheckInterval(self);
    self.hoverState = 'in'
    if (!self.options.delay || !self.options.delay.show) return self.show()
    self.timeout = setTimeout(function () {
      if (self.hoverState == 'in') self.show()
    }, self.options.delay.show)
    this.addOrphanCheck(self);
  }
  Tooltip.prototype.leave = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)
    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }
    clearTimeout(self.timeout)
    this.clearOrphanCheckInterval(self);
    self.hoverState = 'out'
    if (!self.options.delay || !self.options.delay.hide) return self.hide()
    function setSelfTimeout() {
    self.timeout = setTimeout(function () {
      if (self.hoverState == 'out') self.hide()
      }, self.options.delay.hide);
    }
    if (this.$element.hasClass('icon-help')) {
      var $tip = this.tip();
      $tip.one('mouseenter', function() {
        clearTimeout(self.timeout);
        $tip.one('mouseleave', function() {
          setSelfTimeout();
        })
      });
    }
    setSelfTimeout();
  }
  Tooltip.prototype.show = function () {
    var e = $.Event('show.bs.' + this.type)
    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e)
      var inDom = $.contains(document.documentElement, this.$element[0])
      if (e.isDefaultPrevented() || !inDom) return
      var that = this
      var $tip = this.tip()
      var tipId = this.getUID(this.type)
      this.setContent()
      $tip.attr('id', tipId)
      if (this.options.omitAriaDescribedby !== true)
	    this.$element.attr('aria-describedby', tipId)
      if (this.options.animation) $tip.addClass('fade')
      var placement = typeof this.options.placement == 'function' ?
          this.options.placement.call(this, $tip[0], this.$element[0]) :
          this.options.placement
var autoToken = /\s?auto?\s?/i
      var autoPlace = autoToken.test(placement)
      if (autoPlace) placement = placement.replace(autoToken, '') || 'top'
      $tip
        .detach()
        .css({ width: '', top: 0, left: 0, display: 'block' })
        .addClass(placement)
        .data('bs.' + this.type, this)
      this.options.container ? $tip.appendTo($(document).find(this.options.container === '#' ? [] : this.options.container)) : $tip.insertAfter(this.$element)
      var pos          = this.getPosition()
      var actualWidth  = $tip[0].offsetWidth
      var actualHeight = $tip[0].offsetHeight
      if (autoPlace) {
        var orgPlacement = placement
        var $container   = this.options.container ? $($(document).find(this.options.container === '#' ? [] : this.options.container)) : this.$element.parent()
        var containerDim = this.getPosition($container)
		  placement = placement == 'bottom' && pos.top   + pos.height          + actualHeight - containerDim.scroll > containerDim.height ? 'top'    :
				  	  placement == 'top'    && pos.top   - containerDim.scroll - actualHeight < containerDim.top                          ? 'bottom' :
				  	  placement == 'right'  && pos.right + actualWidth         > containerDim.width                                       ? 'left'   :
			  		  placement == 'left'   && pos.left  - actualWidth         < containerDim.left										  ? 'right'  :
		  placement
        $tip
          .removeClass(orgPlacement)
          .addClass(placement)
      }
      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)
      this.applyPlacement(calculatedOffset, placement)
      var complete = function () {
        var prevHoverState = that.hoverState
        that.$element.trigger('shown.bs.' + that.type)
        that.hoverState = null
        if (prevHoverState == 'out') that.leave(that)
      }
      $.support.transition && this.$tip.hasClass('fade') ?
        $tip
          .one('bsTransitionEnd', complete)
          .emulateTransitionEnd(150) :
        complete()
      this.addOrphanCheck(this);
    }
  }
  Tooltip.prototype.applyPlacement = function (offset, placement) {
    var $tip   = this.tip()
    var width  = $tip[0].offsetWidth
    var height = $tip[0].offsetHeight
    var marginTop = parseInt($tip.css('margin-top'), 10)
    var marginLeft = parseInt($tip.css('margin-left'), 10)
    if (isNaN(marginTop))  marginTop  = 0
    if (isNaN(marginLeft)) marginLeft = 0
    offset.top  = offset.top  + marginTop
    offset.left = offset.left + marginLeft
	var viewportDimensions = this.getPosition(this.$viewport);
    var innerTip = $tip.find('.tooltip-inner');
    var innerTipPadding = innerTip ? parseInt(innerTip.css('padding'), 10) : 1;
    $.offset.setOffset($tip[0], $.extend({
      using: function (props) {
        $tip.css({
          top: Math.round(props.top),
          left: Math.round(props.left),
width: width+innerTipPadding
        })
      }
    }, offset), 0)
    $tip.addClass('in')
    var actualWidth  = $tip[0].offsetWidth
    var actualHeight = $tip[0].offsetHeight
    if (placement == 'top' && actualHeight != height) {
      offset.top = offset.top + height - actualHeight
    }
    var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight, viewportDimensions)
var isVertical = /top|bottom/.test(placement)
    if(isVertical && this.options && this.options.container) {
      var $container = this.$element.closest(this.options.container)
      const isContainerSameAsViewport = this.$viewport && this.$viewport[0] === $container[0]
      if($container.length && !isContainerSameAsViewport) {
        var containerDim = this.getPosition($container)
var tooltipExtraLengthAfterThisEle = (actualWidth - this.getPosition().width)/2
        var deltaRWithRespectToContainer = (this.getPosition().right + tooltipExtraLengthAfterThisEle) - (containerDim.left + containerDim.width)
        var deltaLWithRespectToContainer = (containerDim.left) - (this.getPosition().left - tooltipExtraLengthAfterThisEle)
        if(deltaRWithRespectToContainer > 0) {
          if(delta.left <= 0) {
            if(Math.abs(delta.left) < deltaRWithRespectToContainer) {
              delta.left = -deltaRWithRespectToContainer
            }
}
        }
        if(deltaLWithRespectToContainer > 0) {
          if(delta.left >= 0) {
            if(Math.abs(delta.left) < deltaLWithRespectToContainer) {
              delta.left = deltaLWithRespectToContainer
            }
}
        }
      }
    }
    if (delta.left) offset.left += delta.left
    else offset.top += delta.top
  var arrowDelta          = isVertical ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight
  var arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight'
    $tip.offset(offset)
  this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], isVertical, viewportDimensions)
  }
  Tooltip.prototype.replaceArrow = function (delta, dimension, isHorizontal, viewportDimensions) {
    var $arrow = this.arrow();
    if ($arrow.length === 0)
      return;
    $arrow
.css(isHorizontal ? 'left' : 'top', 50 * (1 - delta / dimension) + '%')
      .css(isHorizontal ? 'right' : 'bottom', 'auto')
      .css(isHorizontal ? 'top' : 'left', '');
    if (!viewportDimensions) return ;
    var arrPostion = $arrow.position();
    var arrowLeft = arrPostion.left;
    var arrowTop = arrPostion.right;
    var tipWidth = this.$tip[0].offsetWidth;
    var arrowWidth = $arrow[0].offsetWidth;;
    var arrowMarginLeft = parseInt($arrow.css("margin-left"), 10);
    var tipBorderRadius = parseInt(this.$tip.css("border-radius"), 10);
    var arrowRight = arrowLeft + arrowWidth + arrowMarginLeft;
    var scrollBarWidth = viewportDimensions.scrollbarWidth;
    if (isHorizontal && tipWidth > arrowWidth) {
if (arrowLeft < arrowWidth/2 + tipBorderRadius)
arrowLeft = arrowWidth/2 + tipBorderRadius;
else if (arrowRight > tipWidth)
arrowLeft = tipWidth - arrowWidth/2 - tipBorderRadius;
arrowLeft = arrowLeft - (arrowMarginLeft + arrowWidth / 2);
      $arrow
        .css('right', 'auto')
        .css('left', arrowLeft)
        .css('top', arrowTop);
    } else if(isHorizontal && tipWidth < arrowWidth) {
      $arrow
        .css('margin-bottom', tipBorderRadius);
    }
  }
  Tooltip.prototype.setContent = function () {
    var $tip  = this.tip()
    var title = this.getTitle()
    if (this.options.html) {
      if (this.options.sanitize) {
        title = sanitizeHtml(title, this.options.whiteList, this.options.sanitizeFn)
      }
      $tip.find('.tooltip-inner').html(title)
    } else {
      $tip.find('.tooltip-inner').text(title)
    }
    $tip.removeClass('fade in top bottom left right')
  }
  Tooltip.prototype.hide = function (callback) {
    var that = this
    var $tip = this.tip()
    var e    = $.Event('hide.bs.' + this.type)
    function complete() {
      if (that.hoverState != 'in') $tip.detach()
      that.$element
          .removeAttr('aria-describedby')
          .trigger('hidden.bs.' + that.type)
      callback && callback()
    }
    this.$element.trigger(e)
    if (e.isDefaultPrevented()) return
    $tip.removeClass('in')
    $.support.transition && this.$tip.hasClass('fade') ?
      $tip
        .one('bsTransitionEnd', complete)
        .emulateTransitionEnd(150) :
      complete()
    this.hoverState = null
    return this
  }
  Tooltip.prototype.fixTitle = function () {
    var $e = this.$element
    if ($e.attr('title') || typeof ($e.attr('data-original-title')) != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
    }
  }
  Tooltip.prototype.hasContent = function () {
    return this.getTitle()
  }
  Tooltip.prototype.getPosition = function ($element) {
    $element   = $element || this.$element
    var el     = $element[0]
    var isBody = el.tagName == 'BODY'
    var viewPortScrollOffset = document.viewport ? document.viewport.getScrollOffsets() : {left:0, right: 0};
    return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : null, {
      scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop(),
      width: isBody ? document.documentElement.scrollWidth : $element.outerWidth(),
      height: isBody ? $(window).height() : $element.outerHeight()
    }, isBody ? { top: 0, left: 0 } : $element.offset(), {viewPortScrollOffset:viewPortScrollOffset}, { scrollbarWidth: window.innerWidth - document.documentElement.clientWidth})
  }
  Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2  } :
placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2  } :
placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
{ top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width   }
  }
  Tooltip.prototype.getViewportAdjustedDelta = function (placement, pos, actualWidth, actualHeight, viewportDimensions) {
    var delta = { top: 0, left: 0 }
    if (!this.$viewport) return delta
    var viewportPadding = this.options.viewport && this.options.viewport.padding || 0
    var scrollBarWidth = viewportDimensions.scrollbarWidth;
if (/right|left/.test(placement)) {
      var topEdgeOffset    = pos.top - viewportPadding - viewportDimensions.scroll
      var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight
if (topEdgeOffset < viewportDimensions.top) {
        delta.top = viewportDimensions.top - topEdgeOffset
} else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) {
        delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset
      }
    } else {
      var leftEdgeOffset  = pos.left;
      var rightEdgeOffset = pos.left + actualWidth;
      var scrollLeft = viewportDimensions.x !== undefined && viewportDimensions.viewPortScrollOffset.left === 0 ? viewportDimensions.x : viewportDimensions.viewPortScrollOffset.left;
      var docWidth = document.documentElement.offsetWidth;
      var scrollbarWidthForRTL = document.dir === 'rtl' ? scrollBarWidth : 0;
      var viewportScrollWidth = 0;
      if(this.$viewport && this.$viewport[0]) {
        viewportScrollWidth =  this.$viewport[0].offsetWidth - this.$viewport[0].clientWidth;
      }
if (leftEdgeOffset < scrollLeft) {
        delta.left = scrollbarWidthForRTL + scrollLeft - leftEdgeOffset;
        if(document.dir === 'rtl') {
          delta.left += viewportScrollWidth;
        }
} else if (rightEdgeOffset > docWidth + scrollLeft) {
        delta.left = docWidth + scrollLeft - rightEdgeOffset + scrollbarWidthForRTL
        if(document.dir === 'ltr') {
          delta.left -= viewportScrollWidth;
        }
      }
    }
    return delta
  }
  Tooltip.prototype.getTitle = function () {
    var title
    var $e = this.$element
    var o  = this.options
    title = $e.attr('data-original-title')
      || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)
    return title
  }
  Tooltip.prototype.getUID = function (prefix) {
    do prefix += ~~(Math.random() * 1000000)
    while (document.getElementById(prefix))
    return prefix
  }
  Tooltip.prototype.tip = function () {
    return (this.$tip = this.$tip || $(this.options.template))
  }
  Tooltip.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow'))
  }
  Tooltip.prototype.validate = function () {
    if (!this.$element[0].parentNode) {
      this.hide()
      this.$element = null
      this.options  = null
    }
  }
  Tooltip.prototype.enable = function () {
    this.enabled = true
  }
  Tooltip.prototype.disable = function () {
    this.enabled = false
  }
  Tooltip.prototype.toggleEnabled = function () {
    this.enabled = !this.enabled
  }
  Tooltip.prototype.toggle = function (e) {
    var self = this
    if (e) {
      self = $(e.currentTarget).data('bs.' + this.type)
      if (!self) {
        self = new this.constructor(e.currentTarget, this.getDelegateOptions())
        $(e.currentTarget).data('bs.' + this.type, self)
      }
    }
    self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
  }
  Tooltip.prototype.destroy = function () {
    var that = this
    clearTimeout(this.timeout)
    this.hide(function () {
      that.$element.off('.' + that.type).removeData('bs.' + that.type)
    })
  }
  Tooltip.prototype.sanitizeHtml = function (unsafeHtml) {
    return sanitizeHtml(unsafeHtml, this.options.whiteList, this.options.sanitizeFn)
  }
  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.tooltip')
      var options = typeof option == 'object' && option
      if (!data && option == 'destroy') return
      if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }
  var old = $.fn.tooltip
  $.fn.tooltip             = Plugin
  $.fn.tooltip.Constructor = Tooltip
  $.fn.bsTooltip             = Plugin;
  $.fn.bsTooltip.Constructor = Tooltip;
  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old
    return this
  }
}(jQuery);
;
/*! RESOURCE: /scripts/heisenberg/bootstrap/modal.js */
+function ($) {
  'use strict';
  var Modal = function (element, options) {
    this.options        = options
    this.$body          = $(document.body)
    this.$element       = $(element)
    this.$backdrop      =
    this.isShown        = null
    this.scrollbarWidth = 0
    if (this.options.remote) {
      this.$element
        .find('.modal-content')
        .load(this.options.remote, $.proxy(function () {
          this.$element.trigger('loaded.bs.modal')
        }, this))
    }
  }
  Modal.VERSION  = '3.2.0'
  Modal.DEFAULTS = {
    backdrop: true,
    keyboard: true,
    show: true
  }
  Modal.prototype.toggle = function (_relatedTarget) {
    return this.isShown ? this.hide() : this.show(_relatedTarget)
  }
  Modal.prototype.show = function (_relatedTarget) {
    var that = this
    var e    = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })
    this.$element.trigger(e)
    if (this.isShown || e.isDefaultPrevented()) return
    this.isShown = true
    this.checkScrollbar()
    this.$body.addClass('modal-open')
    this.setScrollbar()
    this.escape()
    this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))
    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade')
      if (!that.$element.parent().length) {
that.$element.appendTo(that.$body)
      }
      that.$element
        .show()
        .scrollTop(0)
      if (transition) {
that.$element[0].offsetWidth
      }
      that.$element
        .addClass('in')
        .attr('aria-hidden', false)
      that.enforceFocus()
      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })
      transition ?
that.$element.find('.modal-dialog')
          .one('bsTransitionEnd', function () {
            that.$element.trigger('focus').trigger(e)
          })
          .emulateTransitionEnd(300) :
        that.$element.trigger('focus').trigger(e)
    })
  }
  Modal.prototype.hide = function (e) {
    if (e) e.preventDefault()
    e = $.Event('hide.bs.modal')
    this.$element.trigger(e)
    if (!this.isShown || e.isDefaultPrevented()) return
    this.isShown = false
    this.$body.removeClass('modal-open')
    this.resetScrollbar()
    this.escape()
    $(document).off('focusin.bs.modal')
    this.$element
      .removeClass('in')
      .attr('aria-hidden', true)
      .off('click.dismiss.bs.modal')
    $.support.transition && this.$element.hasClass('fade') ?
      this.$element
        .one('bsTransitionEnd', $.proxy(this.hideModal, this))
        .emulateTransitionEnd(300) :
      this.hideModal()
  }
  Modal.prototype.enforceFocus = function () {
    $(document)
.off('focusin.bs.modal')
      .on('focusin.bs.modal', $.proxy(function (e) {
        if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
          this.$element.trigger('focus')
        }
      }, this))
  }
  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keydown.dismiss.bs.modal', $.proxy(function (e) {
        e.which == 27 && this.hide()
      }, this))
    } else if (!this.isShown) {
      this.$element.off('keydown.dismiss.bs.modal')
    }
  }
  Modal.prototype.hideModal = function () {
    var that = this
    this.$element.hide()
    this.backdrop(function () {
      that.$element.trigger('hidden.bs.modal')
    })
  }
  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove()
    this.$backdrop = null
  }
  Modal.prototype.backdrop = function (callback) {
    var that = this
    var animate = this.$element.hasClass('fade') ? 'fade' : ''
    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate
this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />')
        .appendTo(this.$body)
      this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
        if (e.target !== e.currentTarget) return
        this.options.backdrop == 'static'
          ? this.$element[0].focus.call(this.$element[0])
          : this.hide.call(this)
      }, this))
if (doAnimate) this.$backdrop[0].offsetWidth
      this.$backdrop.addClass('in')
      if (!callback) return
      doAnimate ?
        this.$backdrop
          .one('bsTransitionEnd', callback)
          .emulateTransitionEnd(150) :
        callback()
    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in')
      var callbackRemove = function () {
        that.removeBackdrop()
        callback && callback()
      }
      $.support.transition && this.$element.hasClass('fade') ?
        this.$backdrop
          .one('bsTransitionEnd', callbackRemove)
          .emulateTransitionEnd(150) :
        callbackRemove()
    } else if (callback) {
      callback()
    }
  }
  Modal.prototype.checkScrollbar = function () {
    if (document.body.clientWidth >= window.innerWidth) return
    this.scrollbarWidth = this.scrollbarWidth || this.measureScrollbar()
  }
  Modal.prototype.setScrollbar = function () {
    var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
    if (this.scrollbarWidth) this.$body.css('padding-right', bodyPad + this.scrollbarWidth)
  }
  Modal.prototype.resetScrollbar = function () {
    this.$body.css('padding-right', '')
  }
Modal.prototype.measureScrollbar = function () {
    var scrollDiv = document.createElement('div')
    scrollDiv.className = 'modal-scrollbar-measure'
    this.$body.append(scrollDiv)
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
    this.$body[0].removeChild(scrollDiv)
    return scrollbarWidth
  }
  function Plugin(option, _relatedTarget) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.modal')
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)
      if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option](_relatedTarget)
      else if (options.show) data.show(_relatedTarget)
    })
  }
  var old = $.fn.modal
  $.fn.modal             = Plugin
  $.fn.modal.Constructor = Modal
  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }
  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this   = $(this)
    var href    = $this.attr('href')
    var target  = $this.attr('data-target') ||
(href && href.replace(/.*(?=#[^\s]+$)/, ''))
    target = target === '#' ? [] : target
    var $target = $(document).find(target)
var option  = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())
    if ($this.is('a')) e.preventDefault()
    $target.one('show.bs.modal', function (showEvent) {
if (showEvent.isDefaultPrevented()) return
      $target.one('hidden.bs.modal', function () {
        $this.is(':visible') && $this.trigger('focus')
      })
    })
    Plugin.call($target, option, this)
  })
}(jQuery);
;
/*! RESOURCE: /scripts/heisenberg/bootstrap/popover.js */
+function ($) {
  'use strict';
  var Popover = function (element, options) {
    this.init('popover', element, options)
  }
  if (!$.fn.tooltip) throw new Error('Popover requires tooltip.js')
  Popover.VERSION  = '3.2.0'
  Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
    placement: 'right',
    trigger: 'click',
    content: '',
template: '<div class="popover" role="dialog" aria-labelledby="popover-title"><div class="arrow"></div><h3 class="popover-title" id="popover-title"></h3><div class="popover-content"></div></div>'
  })
  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype)
  Popover.prototype.constructor = Popover
  Popover.prototype.getDefaults = function () {
    return Popover.DEFAULTS
  }
  Popover.prototype.setContent = function () {
    var $tip    = this.tip()
    var title   = ((this.options.title) ? this.options.title : this.getTitle());
    var content = this.getContent()
    if (this.options.html) {
      var typeContent = typeof content
      if (this.options.sanitize) {
        title = this.sanitizeHtml(title)
        if (typeContent === 'string') {
          content = this.sanitizeHtml(content)
        }
      }
      $tip.find('.popover-title').html(title)
      $tip.find('.popover-content').children().detach().end()[
        typeContent === 'string' ? 'html' : 'append'
      ](content)
    } else {
      $tip.find('.popover-title').text(title)
      $tip.find('.popover-content').children().detach().end().text(content)
    }
    $tip.removeClass('fade top bottom left right in')
    if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide()
  }
  Popover.prototype.hasContent = function () {
    return this.getTitle() || this.getContent()
  }
  Popover.prototype.getContent = function () {
    var $e = this.$element
    var o  = this.options
    return $e.attr('data-content')
      || (typeof o.content == 'function' ?
            o.content.call($e[0]) :
            o.content)
  }
  Popover.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.arrow'))
  }
  Popover.prototype.tip = function () {
    if (!this.$tip) this.$tip = $(this.options.template)
    return this.$tip
  }
  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.popover')
      var options = typeof option == 'object' && option
      if (!data && option == 'destroy') return
      if (!data) $this.data('bs.popover', (data = new Popover(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }
  var old = $.fn.popover
  $.fn.popover             = Plugin
  $.fn.popover.Constructor = Popover
  $.fn.popover.noConflict = function () {
    $.fn.popover = old
    return this
  }
}(jQuery);
;
/*! RESOURCE: /scripts/heisenberg/bootstrap/scrollspy.js */
+function ($) {
  'use strict';
  function ScrollSpy(element, options) {
    var process  = $.proxy(this.process, this)
    this.$body          = $('body')
    this.$scrollElement = $(element).is('body') ? $(window) : $(element)
    this.options        = $.extend({}, ScrollSpy.DEFAULTS, options)
    this.selector       = (this.options.target || '') + ' .nav li > a'
    this.offsets        = []
    this.targets        = []
    this.activeTarget   = null
    this.scrollHeight   = 0
    this.$scrollElement.on('scroll.bs.scrollspy', process)
    this.refresh()
    this.process()
  }
  ScrollSpy.VERSION  = '3.2.0'
  ScrollSpy.DEFAULTS = {
    offset: 10
  }
  ScrollSpy.prototype.getScrollHeight = function () {
    return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight)
  }
  ScrollSpy.prototype.refresh = function () {
    var offsetMethod = 'offset'
    var offsetBase   = 0
    if (!$.isWindow(this.$scrollElement[0])) {
      offsetMethod = 'position'
      offsetBase   = this.$scrollElement.scrollTop()
    }
    this.offsets = []
    this.targets = []
    this.scrollHeight = this.getScrollHeight()
    var self     = this
    this.$body
      .find(this.selector)
      .map(function () {
        var $el   = $(this)
        var href  = $el.data('target') || $el.attr('href')
var $href = /^#./.test(href) && $(href)
        return ($href
          && $href.length
          && $href.is(':visible')
          && [[$href[offsetMethod]().top + offsetBase, href]]) || null
      })
      .sort(function (a, b) { return a[0] - b[0] })
      .each(function () {
        self.offsets.push(this[0])
        self.targets.push(this[1])
      })
  }
  ScrollSpy.prototype.process = function () {
    var scrollTop    = this.$scrollElement.scrollTop() + this.options.offset
    var scrollHeight = this.getScrollHeight()
    var maxScroll    = this.options.offset + scrollHeight - this.$scrollElement.height()
    var offsets      = this.offsets
    var targets      = this.targets
    var activeTarget = this.activeTarget
    var i
    if (this.scrollHeight != scrollHeight) {
      this.refresh()
    }
    if (scrollTop >= maxScroll) {
      return activeTarget != (i = targets[targets.length - 1]) && this.activate(i)
    }
    if (activeTarget && scrollTop <= offsets[0]) {
      return activeTarget != (i = targets[0]) && this.activate(i)
    }
    for (i = offsets.length; i--;) {
      activeTarget != targets[i]
        && scrollTop >= offsets[i]
        && (!offsets[i + 1] || scrollTop <= offsets[i + 1])
        && this.activate(targets[i])
    }
  }
  ScrollSpy.prototype.activate = function (target) {
    this.activeTarget = target
    $(this.selector)
      .parentsUntil(this.options.target, '.active')
      .removeClass('active')
    var selector = this.selector +
        '[data-target="' + target + '"],' +
        this.selector + '[href="' + target + '"]'
    var active = $(selector)
      .parents('li')
      .addClass('active')
    if (active.parent('.dropdown-menu').length) {
      active = active
        .closest('li.dropdown')
        .addClass('active')
    }
    active.trigger('activate.bs.scrollspy')
  }
  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.scrollspy')
      var options = typeof option == 'object' && option
      if (!data) $this.data('bs.scrollspy', (data = new ScrollSpy(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }
  var old = $.fn.scrollspy
  $.fn.scrollspy             = Plugin
  $.fn.scrollspy.Constructor = ScrollSpy
  $.fn.scrollspy.noConflict = function () {
    $.fn.scrollspy = old
    return this
  }
  $(window).on('load.bs.scrollspy.data-api', function () {
    $('[data-spy="scroll"]').each(function () {
      var $spy = $(this)
      Plugin.call($spy, $spy.data())
    })
  })
}(jQuery);
;
/*! RESOURCE: /scripts/heisenberg/bootstrap/transition.js */
+function ($) {
  'use strict';
  function transitionEnd() {
    var el = document.createElement('bootstrap')
    var transEndEventNames = {
      WebkitTransition : 'webkitTransitionEnd',
      MozTransition    : 'transitionend',
      OTransition      : 'oTransitionEnd otransitionend',
      transition       : 'transitionend'
    }
    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }
return false
  }
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false
    var $el = this
    $(this).one('bsTransitionEnd', function () { called = true })
    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
    setTimeout(callback, duration)
    return this
  }
  $(function () {
    $.support.transition = transitionEnd()
    if (!$.support.transition) return
    $.event.special.bsTransitionEnd = {
      bindType: $.support.transition.end,
      delegateType: $.support.transition.end,
      handle: function (e) {
        if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
      }
    }
  })
}(jQuery);
;
/*! RESOURCE: /scripts/heisenberg/custom/prototype.hidefix.js */
(function($) {
	"use strict";
	$.fn.hideFix = function() {
		return this.each(function() {
			if (!window.Prototype)
				return this;
			this.hide = function() {
				if (!jQuery.event.triggered)
					Element.hide(this);
			}
			this.show = function() {
				if (!jQuery.event.triggered)
					Element.show(this);
			}
			return this;
		})
	}
})(jQuery);
;
/*! RESOURCE: /scripts/heisenberg/custom/collapse.js */
(function($) {
	"use strict";
	var bsCollapse = $.fn.collapse;
	$.fn.collapse = function(options) {
		var $this = this;
		$this.hideFix();
		return bsCollapse.call($this, options);
	};
	$(document).on('click.bs.collapse.data-api', '[data-sn-toggle="collapse"]', function(e) {
		var href
		var $this   = $(this)
		var target  = $this.attr('data-target')
			|| e.preventDefault()
|| (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')
		var $target = $(target)
		var data    = $target.data('bs.collapse')
		var option  = data ? 'toggle' : $this.data()
		var parent  = $this.attr('data-parent')
		var $parent = parent && $(parent)
		if (!data || !data.transitioning) {
			if ($parent) $parent.find('[data-toggle="collapse"][data-parent="' + parent + '"]').not($this).addClass('collapsed')
			$this[$target.hasClass('in') ? 'addClass' : 'removeClass']('collapsed')
		}
		$.fn.collapse.call($target, option)
	});
})(jQuery);
;
/*! RESOURCE: /scripts/heisenberg/custom/dropdowns.js */
(function($) {
	"use strict";
	$(document).on('show.bs.dropdown', function(evt) {
		$(evt.relatedTarget).hideFix()
			.parent().hideFix()
			.closest('.dropup, .dropdown').hideFix();
		$('.dropdown-menu', evt.target).data('menu-trigger', evt.relatedTarget);
	});
})(jQuery);
;
/*! RESOURCE: /scripts/heisenberg/custom/modals.js */
(function($) {
	"use strict";
	var bsModal = $.fn.modal.Constructor;
	var bsModalShow = bsModal.prototype.show;
	var bsModalHide = bsModal.prototype.hide;
	var visibleModalStack = [];
	var $document = $(document);
	function isMobileSafari() {
return navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i);
	}
	function forceRedraw(element) {
		return element.offsetLeft;
	}
	function getFirstTabbableElement(container, depth) {
		if (typeof depth === 'undefined')
			depth = 1;
		if (depth === 3)
			return null;
		var elements = window.tabbable(container, 'input, select, a[href], textarea, button, [tabindex]:not(.focus-trap-boundary-south), iframe');
		if (elements.length === 0) return null;
		var result = null;
		if (elements[0].tagName !== 'IFRAME')
			return elements[0];
		for (var i = 0; i <= elements.length - 1 && result === null; i++) {
			result = elements[i];
			if (result.tagName === 'IFRAME')
				result = getFirstTabbableElement(result.contentDocument, depth + 1);
		}
		return result;
	}
	function getLastTabbableElement(container, depth) {
		if (typeof depth === 'undefined')
			depth = 1;
		if (depth === 3)
			return null;
		var elements = window.tabbable(container, 'input, select, a[href], textarea, button, [tabindex]:not(.focus-trap-boundary-south), iframe');
		if (elements.length === 0) return null;
		if (elements[elements.length - 1].tagName !== 'IFRAME')
			return elements[elements.length - 1];
		var result = null;
		for (var i = elements.length - 1; i >= 0 && result === null; i--) {
			result = elements[i];
			if (result.tagName === 'IFRAME')
				result = getLastTabbableElement(result.contentDocument, depth + 1);
		}
		return result;
	}
	function visibleModalFocusInHandler(event) {
		var $modal = visibleModalStack[visibleModalStack.length - 1];
		if (!$modal || !$modal.$element)
			return;
		$modal = $modal.$element;
		if ($modal.attr('focus-escape') === 'true')
			return;
		var modal = $modal[0];
		var targetIsModal = modal === event.target;
		var modalContainsTarget = $modal.has(event.target).length > 0;
		var targetIsSouthernBoundary = event.target.classList.contains('focus-trap-boundary-south');
		var targetIsIframe = event.target.tagName === "IFRAME";
		var isVTBLoadedForm = modal.classList.contains('vtb-classic-form-modal');
		if (!targetIsModal && !isVTBLoadedForm) {
			if (!modalContainsTarget) {
				var lastTabbableElement = getLastTabbableElement(modal);
				if (lastTabbableElement && typeof lastTabbableElement.focus === 'function')
					lastTabbableElement.focus();
				else
					$modal.trigger('focus');
			}
			else if (targetIsSouthernBoundary){
				var firstTabbableElement = getFirstTabbableElement(modal);
				if (firstTabbableElement && typeof firstTabbableElement.focus === 'function')
					firstTabbableElement.focus();
				else
					$modal.trigger('focus');
			}
			else if (targetIsIframe) {
				var firstTabbableElement = getFirstTabbableElement(event.target.contentDocument);
				if (firstTabbableElement && typeof firstTabbableElement.focus === 'function')
					firstTabbableElement.focus();
			}
		}
	}
	bsModal.prototype.show = function() {
		bsModalShow.apply(this, arguments);
		visibleModalStack.push(this);
		var $backdrop = $('body').find('.modal-backdrop').not('.stacked');
		var zmodal = this.$element.css('z-index');
		var zbackdrop = $backdrop.css('z-index');
		this.$element.css('z-index', (~~zmodal) + (10 * visibleModalStack.length));
		$backdrop.css('z-index', (~~zbackdrop) + (10 * visibleModalStack.length));
		$backdrop.addClass('stacked');
		this.$element[0].setAttribute('tabindex', '-1');
		forceRedraw(this.$element[0]);
	};
	bsModal.prototype.hide = function(e) {
		bsModalHide.apply(this, arguments);
		var modalPosition = visibleModalStack.indexOf(this);
		if (modalPosition !== -1)
			visibleModalStack.splice(modalPosition, 1);
		if (this.isShown) return;
		if (visibleModalStack.length > 0)
			$document.on('focusin.bs.modal', visibleModalFocusInHandler)
		this.$element.css('z-index', '');
		forceRedraw(this.$element[0]);
	};
	$document.on('shown.bs.modal hidden.bs.modal', function() {
		if (window._frameChanged)
			_frameChanged();
	})
	$document.on('shown.bs.modal', function(event) {
		$document.off('focusin.bs.modal');
		$document.on('focusin.bs.modal', visibleModalFocusInHandler);
		var modal = event.target;
		var autoFocus = true;
		if (modal.getAttribute('data-auto-focus') === 'false') {
			autoFocus = false;
		}
		if (autoFocus && window.tabbable) {
			var tabbableElements = window.tabbable(modal);
			if (
				tabbableElements
				&& tabbableElements.length
				&& tabbableElements[0]
			) {
				tabbableElements[0].focus();
			}
		}
	});
})(jQuery);
;
/*! RESOURCE: /scripts/heisenberg/custom/tooltips.js */
(function($) {
	"use strict";
	var bsTooltip = $.fn.tooltip.Constructor;
	bsTooltip.DEFAULTS.placement = 'auto';
	bsTooltip.DEFAULTS.delay = {
		'show': 500,
		'hide': 100
	};
	var SN_TOOLTIP_SELECTOR = '.sn-tooltip-basic, *[title]:not(.accessibility_no_tooltip), *[data-dynamic-title]:not(.accessibility_no_tooltip), [data-tooltip-overflow-only="true"]';
	$(function() {
		if ('ontouchstart' in document.documentElement)
			return;
		var $tooltips = $(SN_TOOLTIP_SELECTOR);
		(function setupTooltips() {
			$tooltips.each(function() {
				var $this = $(this);
				$this.hideFix();
				if (this.hasAttribute('title') && !this.hasAttribute('data-original-title'))
					this.setAttribute('data-original-title', this.getAttribute('title'));
			})
		})();
		$(document.body).on('mouseenter focus', SN_TOOLTIP_SELECTOR, function(evt) {
			if (this.tagName == 'IFRAME' || this.tagName == 'OPTION')
				return;
			var $this = $(this);
			$this.hideFix();
			var $target = $(evt.target);
			if ($this.data('bs.tooltip'))
				return;
			if (this.getAttribute('data-tooltip-overflow-only') === 'true' && !this.hasAttribute('title')) {
				var text = $this.find('[data-tooltip-overflow-only-text="true"]')[0];
				if (text && text.offsetWidth < text.scrollWidth) {
					this.setAttribute('title', text.textContent);
				}
			}
			
			if (this.hasAttribute('title') && !this.hasAttribute('data-original-title'))
				this.setAttribute('data-original-title', this.getAttribute('title'));
			
			$this.tooltip({
				container: $this.attr('data-container') || 'body',
				title: function() {
					return $(this).attr('data-dynamic-title');
				},
				omitAriaDescribedby: $target.data('omit-aria-describedby')
			});
			$this.on('click', function() {
				$this.tooltip('hide');
			});
			if ($this.hasClass('icon-help')) {
				$this.on('keyup', function(e) {
					if (e.which === 27)
						$this.tooltip('hide');
				});
			}
			var tooltipDuration = 10;
			if (window.g_accessibility && typeof g_accessibility_tooltip_duration !== 'undefined')
				tooltipDuration = g_accessibility_tooltip_duration;
			if (tooltipDuration !== 0) {
				$this.on('shown.bs.tooltip', function() {
					setTimeout(function() {
						$this.tooltip('hide');
					}, tooltipDuration * 1000);
				});
			}
			$this.data('hover', setTimeout(function() {
				$this.tooltip('show');
			}, bsTooltip.DEFAULTS.delay.show));
		});
		$(document.body).on('mouseleave blur', SN_TOOLTIP_SELECTOR, function() {
			var $this = $(this);
			var hover = $this.data('hover');
			if (hover) {
				clearTimeout($this.data('hover'));
				$this.removeData('hover')
			}
		});
		$(document).bind('mouseleave', function(evt) {
			if ($('.tooltip').length === 0)
				return;
			$('.sn-tooltip-basic, *[title]').each(function() {
				if (this.tagName == 'IFRAME')
					return;
				var $this = $(this);
				if ($this.data('bs.tooltip'))
					$this.tooltip('hide');
			})
		})
	});
})(jQuery);
;
/*! RESOURCE: /scripts/heisenberg/custom/snPopover.js */
(function($) {
	"use strict";
	var Popover = $.fn.popover.Constructor;
	var popoverCount = 0;
	var bsPopoverInit = Popover.prototype.init;
	var bsPopoverShow = Popover.prototype.show;
	var bsPopoverHide = Popover.prototype.hide;
	var bsPopoverFixTitle = Popover.prototype.fixTitle;
	Popover.prototype.init = function (type, element, options) {
		var $e = $(element);
		var $target = $($e.data('target'));
		var popoverId = popoverCount++;
		var wide = !!$e.data('wide');
		$e.hideFix();
		this.$target = $target;
		this.$target.hide();
		this.popoverId = popoverId;
		options = $.extend({}, {
			html: true,
			content: function () {
				if (wide)
					this.tip().addClass('wide');
				var placeholderId = 'popover-placeholder-' + popoverId;
				if (!document.getElementById(placeholderId))
$target.before('<div id="' + placeholderId + '" class="popover-placeholder" />');
				$target.show();
				return $target;
			}.bind(this)
		}, options);
		bsPopoverInit.call(this, type, element, options);
	};
	Popover.prototype.fixTitle = function() {
		var trigger = this.options.trigger;
if (typeof trigger === "undefined" || trigger === "" || /hover/.test(trigger))
			bsPopoverFixTitle.apply(this, arguments);
	};
	Popover.prototype.show = function () {
		var $e = this.$element;
		bsPopoverShow.apply(this, arguments);
		$e.addClass('active');
		this.tip().one('click', '[data-dismiss=popover]', function () {
			$e.popover('hide');
			$e[0].focus();
		});
	};
	Popover.prototype.hide = function () {
		var $e = this.$element;
		var $target = this.$target;
		var $popover = $target.closest('.popover');
		var popoverId = this.popoverId;
		function saveOffContent() {
			$e.removeClass('active');
			var $placeholder = $('#popover-placeholder-' + popoverId);
			if (!$placeholder.length || !$target.length)
				return;
			var $innerContent = $target.detach();
			if ($innerContent.length === 0)
				return;
			$innerContent.hide();
			$placeholder.replaceWith($innerContent);
		}
		if ($.support.transition && $popover.hasClass('fade'))
			$popover.one('bsTransitionEnd', saveOffContent);
		else
			saveOffContent();
		bsPopoverHide.apply(this, arguments);
	};
	Popover.prototype.getTitle = function() {
		var $e = this.$element;
		var title = $e.data('popover-title');
		var expectingHtml = this.options && this.options.html;
		var isHtml = typeof $e.data('popover-title-is-html') !== 'undefined' ? $e.data('popover-title-is-html') : expectingHtml;
		if (expectingHtml && !isHtml) {
title  = $('<div />').text(title).html();
		}
		return title || $.fn.tooltip.Constructor.prototype.getTitle.call(this);
	}
})(jQuery);
;
/*! RESOURCE: /scripts/heisenberg/custom/popovers.js */
(function($) {
	"use strict";
	$(function() {
		$('.sn-popover-basic').each(function() {
			var $this = $(this);
			if (!$this.data('bs.popover'))
				$(this).popover();
		});
		function hideOpenPopovers() {
			$('.sn-popover-basic').each(function() {
				var $this = $(this);
				if ($this.attr('aria-describedby') !== undefined)
					$this.popover('hide');
			});
		}
		function resetContainer() {
			$('.sn-popover-basic').each(function() {
				var $this = $(this);
				$this.popover({container: $this.data('container')});
			});
		}
		
		function debounce(fn, threshold, fireOnStart) {
			var timeout;
			return function() {
				var obj = this,
					args = arguments;
				threshold = (threshold !== undefined) ? threshold : 500;
				function delayed() {
					if (!fireOnStart)
						fn.apply(obj, args);
					timeout = null;
				}
				if (timeout)
					clearTimeout(timeout);
				else if (fireOnStart)
					fn.apply(obj, args);
				timeout = setTimeout(delayed, threshold);
			};
		}
		function closeOnBlur(e) {
			function eventTargetInElement(elem) {
				return elem.is(e.target) || elem.has(e.target).length !== 0
			}
			$('.sn-popover-basic').each(function() {
				var $popoverButton = $(this);
				var $popoverContent = $($popoverButton.data('target'));
				if (!$popoverButton.hasClass('active'))
					return;
				if (e.target.closest("#tag_form"))
					return;
				if (eventTargetInElement($popoverButton) || eventTargetInElement($popoverContent))
					return;
				if ($popoverButton.data('auto-close') === false && !$(e.target).is('.sn-popover-basic'))
					return;
				$popoverButton.popover('hide');
			});
		}
		var debouncedResetContainer = debounce(resetContainer);
		var debouncedHideOpenPopovers = debounce(hideOpenPopovers, 0, true);
		var debouncedCloseOnBlur = debounce(closeOnBlur, 10);
		$(window).on('resize', function() {
			if ('ontouchstart' in document.documentElement && document.activeElement.type === 'text')
				return;
debouncedHideOpenPopovers();
debouncedResetContainer();
		});
		$('html').on('click', function(e) {
			debouncedCloseOnBlur(e);
		});
		if (CustomEvent && CustomEvent.observe) {
			CustomEvent.observe('body_clicked', function(e) {
				debouncedCloseOnBlur(e);
			});
		}
	});
	$(document).on('show.bs.popover hide.bs.popover', function() {
		if (window._frameChanged)
			_frameChanged();
	})
})(jQuery);
;
/*! RESOURCE: /scripts/select2_doctype/select2.min.js */
!function($){void 0===$.fn.each2&&$.extend($.fn,{each2:function(c){for(var j=$([0]),i=-1,l=this.length;++i<l&&(j.context=j[0]=this[i])&&!1!==c.call(j[0],i,j););return this}})}(jQuery),function($,undefined){"use strict";var AbstractSelect2,SingleSelect2,MultiSelect2,nextUid,sizer,lastMousePosition,scrollBarDimensions,KEY,DIACRITICS,counter,$document;function reinsertElement(element){var placeholder=$(document.createTextNode(""));element.before(placeholder),placeholder.before(element),placeholder.remove()}function stripDiacritics(str){return str.replace(/[^\u0000-\u007E]/g,function(a){return DIACRITICS[a]||a})}function indexOf(value,array){for(var i=0,l=array.length;i<l;i+=1)if(equal(value,array[i]))return i;return-1}function equal(a,b){return a===b||a!==undefined&&b!==undefined&&null!==a&&null!==b&&(a.constructor===String?a+""==b+"":b.constructor===String&&b+""==a+"")}function splitVal(string,separator){var val,i,l;if(null===string||string.length<1)return[];for(i=0,l=(val=string.split(separator)).length;i<l;i+=1)val[i]=$.trim(val[i]);return val}function getSideBorderPadding(element){return element.outerWidth(!1)-element.width()}function installKeyUpChangeEvent(element){var key="keyup-change-value";element.on("keydown",function(){$.data(element,key)===undefined&&$.data(element,key,element.val())}),element.on("keyup",function(){var val=$.data(element,key);val!==undefined&&element.val()!==val&&($.removeData(element,key),element.trigger("keyup-change"))})}function debounce(quietMillis,fn,ctx){var timeout;return ctx=ctx||undefined,function(){var args=arguments;window.clearTimeout(timeout),timeout=window.setTimeout(function(){fn.apply(ctx,args)},quietMillis)}}function killEvent(event){event.preventDefault(),event.stopPropagation()}function syncCssClasses(dest,src,adapter){var adapted,replacements=[],classes=$.trim(dest.attr("class"));classes&&$((classes=""+classes).split(/\s+/)).each2(function(){0===this.indexOf("select2-")&&replacements.push(this)}),(classes=$.trim(src.attr("class")))&&$((classes=""+classes).split(/\s+/)).each2(function(){0!==this.indexOf("select2-")&&(adapted=adapter(this))&&replacements.push(adapted)}),dest.attr("class",replacements.join(" ")),-1<replacements.indexOf("hidden-select2")&&dest.attr("aria-hidden","true")}function markMatch(text,term,markup,escapeMarkup){var match=stripDiacritics(text.toUpperCase()).indexOf(stripDiacritics(term.toUpperCase())),term=term.length;match<0?markup.push(escapeMarkup(text)):(markup.push(escapeMarkup(text.substring(0,match))),markup.push("<span class='select2-match'>"),markup.push(escapeMarkup(text.substring(match,match+term))),markup.push("</span>"),markup.push(escapeMarkup(text.substring(match+term,text.length))))}function defaultEscapeMarkup(markup){var replace_map={"\\":"&#92;","&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#47;"};return String(markup).replace(/[&<>"'\/\\]/g,function(match){return replace_map[match]})}function ajax(options){var timeout,handler=null,quietMillis=options.quietMillis||100,ajaxUrl=options.url,self=this;return function(query){window.clearTimeout(timeout),timeout=window.setTimeout(function(){var data=options.data,url=ajaxUrl,transport=options.transport||$.fn.select2.ajaxDefaults.transport,deprecated={type:options.type||"GET",cache:options.cache||!1,jsonpCallback:options.jsonpCallback||undefined,dataType:options.dataType||"json"},deprecated=$.extend({},$.fn.select2.ajaxDefaults.params,deprecated),data=data?data.call(self,query.term,query.page,query.context):null,url="function"==typeof url?url.call(self,query.term,query.page,query.context):url;handler&&"function"==typeof handler.abort&&handler.abort(),options.params&&($.isFunction(options.params)?$.extend(deprecated,options.params.call(self)):$.extend(deprecated,options.params)),$.extend(deprecated,{url:url,dataType:options.dataType,data:data,success:function(data){data=options.results(data,query.page,query);query.callback(data)},error:function(jqXHR,textStatus,errorThrown){query.callback({hasError:!0,jqXHR:jqXHR,textStatus:textStatus,errorThrown:errorThrown})}}),handler=transport.call(self,deprecated)},quietMillis)}}function local(options){var dataText,tmp,data=options,text=function(item){return""+item.text},options=($.isArray(data)&&(data={results:tmp=data}),!1===$.isFunction(data)&&(tmp=data,data=function(){return tmp}),data());return options.text&&(text=options.text,$.isFunction(text)||(dataText=options.text,text=function(item){return item[dataText]})),function(query){var process,t=query.term,filtered={results:[]};""===t?query.callback(data()):(process=function(datum,collection){var group,attr;if((datum=datum[0]).children){for(attr in group={},datum)datum.hasOwnProperty(attr)&&(group[attr]=datum[attr]);group.children=[],$(datum.children).each2(function(i,childDatum){process(childDatum,group.children)}),(group.children.length||query.matcher(t,text(group),datum))&&collection.push(group)}else query.matcher(t,text(datum),datum)&&collection.push(datum)},$(data().results).each2(function(i,datum){process(datum,filtered.results)}),query.callback(filtered))}}function tags(data){var isFunc=$.isFunction(data);return function(query){var t=query.term,filtered={results:[]},result=isFunc?data(query):data;$.isArray(result)&&($(result).each(function(){var isObject=this.text!==undefined,text=isObject?this.text:this;""!==t&&!query.matcher(t,text)||filtered.results.push(isObject?this:{id:this,text:this})}),query.callback(filtered))}}function checkFormatter(formatter,formatterName){if($.isFunction(formatter))return 1;if(formatter){if("string"==typeof formatter)return 1;throw new Error(formatterName+" must be a string, function, or falsy value")}}function evaluate(val,context){var args;return $.isFunction(val)?(args=Array.prototype.slice.call(arguments,2),val.apply(context,args)):val}function cleanupJQueryElements(){var self=this;$.each(arguments,function(i,element){self[element].remove(),self[element]=null})}function clazz(SuperClass,methods){function constructor(){}return((constructor.prototype=new SuperClass).constructor=constructor).prototype.parent=SuperClass.prototype,constructor.prototype=$.extend(constructor.prototype,methods),constructor}window.Select2===undefined&&(lastMousePosition={x:0,y:0},KEY={TAB:9,ENTER:13,ESC:27,SPACE:32,LEFT:37,UP:38,RIGHT:39,DOWN:40,SHIFT:16,CTRL:17,ALT:18,PAGE_UP:33,PAGE_DOWN:34,HOME:36,END:35,BACKSPACE:8,DELETE:46,isArrow:function(k){switch(k=k.which||k){case KEY.LEFT:case KEY.RIGHT:case KEY.UP:case KEY.DOWN:return!0}return!1},isControl:function(e){switch(e.which){case KEY.SHIFT:case KEY.CTRL:case KEY.ALT:return!0}return!!e.metaKey},isFunctionKey:function(k){return 112<=(k=k.which||k)&&k<=123}},DIACRITICS={"Ⓐ":"A","Ａ":"A","À":"A","Á":"A","Â":"A","Ầ":"A","Ấ":"A","Ẫ":"A","Ẩ":"A","Ã":"A","Ā":"A","Ă":"A","Ằ":"A","Ắ":"A","Ẵ":"A","Ẳ":"A","Ȧ":"A","Ǡ":"A","Ä":"A","Ǟ":"A","Ả":"A","Å":"A","Ǻ":"A","Ǎ":"A","Ȁ":"A","Ȃ":"A","Ạ":"A","Ậ":"A","Ặ":"A","Ḁ":"A","Ą":"A","Ⱥ":"A","Ɐ":"A","Ꜳ":"AA","Æ":"AE","Ǽ":"AE","Ǣ":"AE","Ꜵ":"AO","Ꜷ":"AU","Ꜹ":"AV","Ꜻ":"AV","Ꜽ":"AY","Ⓑ":"B","Ｂ":"B","Ḃ":"B","Ḅ":"B","Ḇ":"B","Ƀ":"B","Ƃ":"B","Ɓ":"B","Ⓒ":"C","Ｃ":"C","Ć":"C","Ĉ":"C","Ċ":"C","Č":"C","Ç":"C","Ḉ":"C","Ƈ":"C","Ȼ":"C","Ꜿ":"C","Ⓓ":"D","Ｄ":"D","Ḋ":"D","Ď":"D","Ḍ":"D","Ḑ":"D","Ḓ":"D","Ḏ":"D","Đ":"D","Ƌ":"D","Ɗ":"D","Ɖ":"D","Ꝺ":"D","Ǳ":"DZ","Ǆ":"DZ","ǲ":"Dz","ǅ":"Dz","Ⓔ":"E","Ｅ":"E","È":"E","É":"E","Ê":"E","Ề":"E","Ế":"E","Ễ":"E","Ể":"E","Ẽ":"E","Ē":"E","Ḕ":"E","Ḗ":"E","Ĕ":"E","Ė":"E","Ë":"E","Ẻ":"E","Ě":"E","Ȅ":"E","Ȇ":"E","Ẹ":"E","Ệ":"E","Ȩ":"E","Ḝ":"E","Ę":"E","Ḙ":"E","Ḛ":"E","Ɛ":"E","Ǝ":"E","Ⓕ":"F","Ｆ":"F","Ḟ":"F","Ƒ":"F","Ꝼ":"F","Ⓖ":"G","Ｇ":"G","Ǵ":"G","Ĝ":"G","Ḡ":"G","Ğ":"G","Ġ":"G","Ǧ":"G","Ģ":"G","Ǥ":"G","Ɠ":"G","Ꞡ":"G","Ᵹ":"G","Ꝿ":"G","Ⓗ":"H","Ｈ":"H","Ĥ":"H","Ḣ":"H","Ḧ":"H","Ȟ":"H","Ḥ":"H","Ḩ":"H","Ḫ":"H","Ħ":"H","Ⱨ":"H","Ⱶ":"H","Ɥ":"H","Ⓘ":"I","Ｉ":"I","Ì":"I","Í":"I","Î":"I","Ĩ":"I","Ī":"I","Ĭ":"I","İ":"I","Ï":"I","Ḯ":"I","Ỉ":"I","Ǐ":"I","Ȉ":"I","Ȋ":"I","Ị":"I","Į":"I","Ḭ":"I","Ɨ":"I","Ⓙ":"J","Ｊ":"J","Ĵ":"J","Ɉ":"J","Ⓚ":"K","Ｋ":"K","Ḱ":"K","Ǩ":"K","Ḳ":"K","Ķ":"K","Ḵ":"K","Ƙ":"K","Ⱪ":"K","Ꝁ":"K","Ꝃ":"K","Ꝅ":"K","Ꞣ":"K","Ⓛ":"L","Ｌ":"L","Ŀ":"L","Ĺ":"L","Ľ":"L","Ḷ":"L","Ḹ":"L","Ļ":"L","Ḽ":"L","Ḻ":"L","Ł":"L","Ƚ":"L","Ɫ":"L","Ⱡ":"L","Ꝉ":"L","Ꝇ":"L","Ꞁ":"L","Ǉ":"LJ","ǈ":"Lj","Ⓜ":"M","Ｍ":"M","Ḿ":"M","Ṁ":"M","Ṃ":"M","Ɱ":"M","Ɯ":"M","Ⓝ":"N","Ｎ":"N","Ǹ":"N","Ń":"N","Ñ":"N","Ṅ":"N","Ň":"N","Ṇ":"N","Ņ":"N","Ṋ":"N","Ṉ":"N","Ƞ":"N","Ɲ":"N","Ꞑ":"N","Ꞥ":"N","Ǌ":"NJ","ǋ":"Nj","Ⓞ":"O","Ｏ":"O","Ò":"O","Ó":"O","Ô":"O","Ồ":"O","Ố":"O","Ỗ":"O","Ổ":"O","Õ":"O","Ṍ":"O","Ȭ":"O","Ṏ":"O","Ō":"O","Ṑ":"O","Ṓ":"O","Ŏ":"O","Ȯ":"O","Ȱ":"O","Ö":"O","Ȫ":"O","Ỏ":"O","Ő":"O","Ǒ":"O","Ȍ":"O","Ȏ":"O","Ơ":"O","Ờ":"O","Ớ":"O","Ỡ":"O","Ở":"O","Ợ":"O","Ọ":"O","Ộ":"O","Ǫ":"O","Ǭ":"O","Ø":"O","Ǿ":"O","Ɔ":"O","Ɵ":"O","Ꝋ":"O","Ꝍ":"O","Ƣ":"OI","Ꝏ":"OO","Ȣ":"OU","Ⓟ":"P","Ｐ":"P","Ṕ":"P","Ṗ":"P","Ƥ":"P","Ᵽ":"P","Ꝑ":"P","Ꝓ":"P","Ꝕ":"P","Ⓠ":"Q","Ｑ":"Q","Ꝗ":"Q","Ꝙ":"Q","Ɋ":"Q","Ⓡ":"R","Ｒ":"R","Ŕ":"R","Ṙ":"R","Ř":"R","Ȑ":"R","Ȓ":"R","Ṛ":"R","Ṝ":"R","Ŗ":"R","Ṟ":"R","Ɍ":"R","Ɽ":"R","Ꝛ":"R","Ꞧ":"R","Ꞃ":"R","Ⓢ":"S","Ｓ":"S","ẞ":"S","Ś":"S","Ṥ":"S","Ŝ":"S","Ṡ":"S","Š":"S","Ṧ":"S","Ṣ":"S","Ṩ":"S","Ș":"S","Ş":"S","Ȿ":"S","Ꞩ":"S","Ꞅ":"S","Ⓣ":"T","Ｔ":"T","Ṫ":"T","Ť":"T","Ṭ":"T","Ț":"T","Ţ":"T","Ṱ":"T","Ṯ":"T","Ŧ":"T","Ƭ":"T","Ʈ":"T","Ⱦ":"T","Ꞇ":"T","Ꜩ":"TZ","Ⓤ":"U","Ｕ":"U","Ù":"U","Ú":"U","Û":"U","Ũ":"U","Ṹ":"U","Ū":"U","Ṻ":"U","Ŭ":"U","Ü":"U","Ǜ":"U","Ǘ":"U","Ǖ":"U","Ǚ":"U","Ủ":"U","Ů":"U","Ű":"U","Ǔ":"U","Ȕ":"U","Ȗ":"U","Ư":"U","Ừ":"U","Ứ":"U","Ữ":"U","Ử":"U","Ự":"U","Ụ":"U","Ṳ":"U","Ų":"U","Ṷ":"U","Ṵ":"U","Ʉ":"U","Ⓥ":"V","Ｖ":"V","Ṽ":"V","Ṿ":"V","Ʋ":"V","Ꝟ":"V","Ʌ":"V","Ꝡ":"VY","Ⓦ":"W","Ｗ":"W","Ẁ":"W","Ẃ":"W","Ŵ":"W","Ẇ":"W","Ẅ":"W","Ẉ":"W","Ⱳ":"W","Ⓧ":"X","Ｘ":"X","Ẋ":"X","Ẍ":"X","Ⓨ":"Y","Ｙ":"Y","Ỳ":"Y","Ý":"Y","Ŷ":"Y","Ỹ":"Y","Ȳ":"Y","Ẏ":"Y","Ÿ":"Y","Ỷ":"Y","Ỵ":"Y","Ƴ":"Y","Ɏ":"Y","Ỿ":"Y","Ⓩ":"Z","Ｚ":"Z","Ź":"Z","Ẑ":"Z","Ż":"Z","Ž":"Z","Ẓ":"Z","Ẕ":"Z","Ƶ":"Z","Ȥ":"Z","Ɀ":"Z","Ⱬ":"Z","Ꝣ":"Z","ⓐ":"a","ａ":"a","ẚ":"a","à":"a","á":"a","â":"a","ầ":"a","ấ":"a","ẫ":"a","ẩ":"a","ã":"a","ā":"a","ă":"a","ằ":"a","ắ":"a","ẵ":"a","ẳ":"a","ȧ":"a","ǡ":"a","ä":"a","ǟ":"a","ả":"a","å":"a","ǻ":"a","ǎ":"a","ȁ":"a","ȃ":"a","ạ":"a","ậ":"a","ặ":"a","ḁ":"a","ą":"a","ⱥ":"a","ɐ":"a","ꜳ":"aa","æ":"ae","ǽ":"ae","ǣ":"ae","ꜵ":"ao","ꜷ":"au","ꜹ":"av","ꜻ":"av","ꜽ":"ay","ⓑ":"b","ｂ":"b","ḃ":"b","ḅ":"b","ḇ":"b","ƀ":"b","ƃ":"b","ɓ":"b","ⓒ":"c","ｃ":"c","ć":"c","ĉ":"c","ċ":"c","č":"c","ç":"c","ḉ":"c","ƈ":"c","ȼ":"c","ꜿ":"c","ↄ":"c","ⓓ":"d","ｄ":"d","ḋ":"d","ď":"d","ḍ":"d","ḑ":"d","ḓ":"d","ḏ":"d","đ":"d","ƌ":"d","ɖ":"d","ɗ":"d","ꝺ":"d","ǳ":"dz","ǆ":"dz","ⓔ":"e","ｅ":"e","è":"e","é":"e","ê":"e","ề":"e","ế":"e","ễ":"e","ể":"e","ẽ":"e","ē":"e","ḕ":"e","ḗ":"e","ĕ":"e","ė":"e","ë":"e","ẻ":"e","ě":"e","ȅ":"e","ȇ":"e","ẹ":"e","ệ":"e","ȩ":"e","ḝ":"e","ę":"e","ḙ":"e","ḛ":"e","ɇ":"e","ɛ":"e","ǝ":"e","ⓕ":"f","ｆ":"f","ḟ":"f","ƒ":"f","ꝼ":"f","ⓖ":"g","ｇ":"g","ǵ":"g","ĝ":"g","ḡ":"g","ğ":"g","ġ":"g","ǧ":"g","ģ":"g","ǥ":"g","ɠ":"g","ꞡ":"g","ᵹ":"g","ꝿ":"g","ⓗ":"h","ｈ":"h","ĥ":"h","ḣ":"h","ḧ":"h","ȟ":"h","ḥ":"h","ḩ":"h","ḫ":"h","ẖ":"h","ħ":"h","ⱨ":"h","ⱶ":"h","ɥ":"h","ƕ":"hv","ⓘ":"i","ｉ":"i","ì":"i","í":"i","î":"i","ĩ":"i","ī":"i","ĭ":"i","ï":"i","ḯ":"i","ỉ":"i","ǐ":"i","ȉ":"i","ȋ":"i","ị":"i","į":"i","ḭ":"i","ɨ":"i","ı":"i","ⓙ":"j","ｊ":"j","ĵ":"j","ǰ":"j","ɉ":"j","ⓚ":"k","ｋ":"k","ḱ":"k","ǩ":"k","ḳ":"k","ķ":"k","ḵ":"k","ƙ":"k","ⱪ":"k","ꝁ":"k","ꝃ":"k","ꝅ":"k","ꞣ":"k","ⓛ":"l","ｌ":"l","ŀ":"l","ĺ":"l","ľ":"l","ḷ":"l","ḹ":"l","ļ":"l","ḽ":"l","ḻ":"l","ſ":"l","ł":"l","ƚ":"l","ɫ":"l","ⱡ":"l","ꝉ":"l","ꞁ":"l","ꝇ":"l","ǉ":"lj","ⓜ":"m","ｍ":"m","ḿ":"m","ṁ":"m","ṃ":"m","ɱ":"m","ɯ":"m","ⓝ":"n","ｎ":"n","ǹ":"n","ń":"n","ñ":"n","ṅ":"n","ň":"n","ṇ":"n","ņ":"n","ṋ":"n","ṉ":"n","ƞ":"n","ɲ":"n","ŉ":"n","ꞑ":"n","ꞥ":"n","ǌ":"nj","ⓞ":"o","ｏ":"o","ò":"o","ó":"o","ô":"o","ồ":"o","ố":"o","ỗ":"o","ổ":"o","õ":"o","ṍ":"o","ȭ":"o","ṏ":"o","ō":"o","ṑ":"o","ṓ":"o","ŏ":"o","ȯ":"o","ȱ":"o","ö":"o","ȫ":"o","ỏ":"o","ő":"o","ǒ":"o","ȍ":"o","ȏ":"o","ơ":"o","ờ":"o","ớ":"o","ỡ":"o","ở":"o","ợ":"o","ọ":"o","ộ":"o","ǫ":"o","ǭ":"o","ø":"o","ǿ":"o","ɔ":"o","ꝋ":"o","ꝍ":"o","ɵ":"o","ƣ":"oi","ȣ":"ou","ꝏ":"oo","ⓟ":"p","ｐ":"p","ṕ":"p","ṗ":"p","ƥ":"p","ᵽ":"p","ꝑ":"p","ꝓ":"p","ꝕ":"p","ⓠ":"q","ｑ":"q","ɋ":"q","ꝗ":"q","ꝙ":"q","ⓡ":"r","ｒ":"r","ŕ":"r","ṙ":"r","ř":"r","ȑ":"r","ȓ":"r","ṛ":"r","ṝ":"r","ŗ":"r","ṟ":"r","ɍ":"r","ɽ":"r","ꝛ":"r","ꞧ":"r","ꞃ":"r","ⓢ":"s","ｓ":"s","ß":"s","ś":"s","ṥ":"s","ŝ":"s","ṡ":"s","š":"s","ṧ":"s","ṣ":"s","ṩ":"s","ș":"s","ş":"s","ȿ":"s","ꞩ":"s","ꞅ":"s","ẛ":"s","ⓣ":"t","ｔ":"t","ṫ":"t","ẗ":"t","ť":"t","ṭ":"t","ț":"t","ţ":"t","ṱ":"t","ṯ":"t","ŧ":"t","ƭ":"t","ʈ":"t","ⱦ":"t","ꞇ":"t","ꜩ":"tz","ⓤ":"u","ｕ":"u","ù":"u","ú":"u","û":"u","ũ":"u","ṹ":"u","ū":"u","ṻ":"u","ŭ":"u","ü":"u","ǜ":"u","ǘ":"u","ǖ":"u","ǚ":"u","ủ":"u","ů":"u","ű":"u","ǔ":"u","ȕ":"u","ȗ":"u","ư":"u","ừ":"u","ứ":"u","ữ":"u","ử":"u","ự":"u","ụ":"u","ṳ":"u","ų":"u","ṷ":"u","ṵ":"u","ʉ":"u","ⓥ":"v","ｖ":"v","ṽ":"v","ṿ":"v","ʋ":"v","ꝟ":"v","ʌ":"v","ꝡ":"vy","ⓦ":"w","ｗ":"w","ẁ":"w","ẃ":"w","ŵ":"w","ẇ":"w","ẅ":"w","ẘ":"w","ẉ":"w","ⱳ":"w","ⓧ":"x","ｘ":"x","ẋ":"x","ẍ":"x","ⓨ":"y","ｙ":"y","ỳ":"y","ý":"y","ŷ":"y","ỹ":"y","ȳ":"y","ẏ":"y","ÿ":"y","ỷ":"y","ẙ":"y","ỵ":"y","ƴ":"y","ɏ":"y","ỿ":"y","ⓩ":"z","ｚ":"z","ź":"z","ẑ":"z","ż":"z","ž":"z","ẓ":"z","ẕ":"z","ƶ":"z","ȥ":"z","ɀ":"z","ⱬ":"z","ꝣ":"z","Ά":"Α","Έ":"Ε","Ή":"Η","Ί":"Ι","Ϊ":"Ι","Ό":"Ο","Ύ":"Υ","Ϋ":"Υ","Ώ":"Ω","ά":"α","έ":"ε","ή":"η","ί":"ι","ϊ":"ι","ΐ":"ι","ό":"ο","ύ":"υ","ϋ":"υ","ΰ":"υ","ω":"ω","ς":"σ"},$document=$(document),counter=1,nextUid=function(){return counter++},AbstractSelect2=clazz(Object,{bind:function(func){var self=this;return function(){func.apply(self,arguments)}},init:function(opts){this.opts=opts=this.prepareOpts(opts),this.id=opts.id,opts.element.data("select2")!==undefined&&null!==opts.element.data("select2")&&opts.element.data("select2").destroy(),this.container=this.createContainer(),this.liveRegion=$("<span>",{role:"status","aria-live":"polite"}).addClass("select2-hidden-accessible").appendTo(document.body),this.containerId="s2id_"+(opts.element.attr("id")||"autogen"+nextUid()),this.containerEventName=this.containerId.replace(/([.])/g,"_").replace(/([;&,\-\.\+\*\~':"\!\^#$%@\[\]\(\)=>\|])/g,"\\$1"),this.container.attr("id",this.containerId),this.container.attr("title",opts.element.attr("title")),this.body=$("body"),syncCssClasses(this.container,this.opts.element,this.opts.adaptContainerCssClass),this.container.attr("style",opts.element.attr("style")),this.container.css(evaluate(opts.containerCss,this.opts.element)),this.container.addClass(evaluate(opts.containerCssClass,this.opts.element)),this.container.attr("role","none"),this.elementTabIndex=this.opts.element.attr("tabindex"),this.opts.element.data("select2",this).attr("tabindex","-1").before(this.container).on("click.select2",killEvent),this.container.data("select2",this),this.dropdown=this.container.find(".select2-drop"),syncCssClasses(this.dropdown,this.opts.element,this.opts.adaptDropdownCssClass),this.dropdown.addClass(evaluate(opts.dropdownCssClass,this.opts.element)),this.dropdown.data("select2",this),this.dropdown.on("click",killEvent),this.results=results=this.container.find(".select2-results"),this.search=search=this.container.find("input.select2-input"),this.queryCount=0,this.resultsPage=0,this.context=null,this.initContainer(),this.container.on("click",killEvent),this.results.on("mousemove",function(e){var lastpos=lastMousePosition;lastpos!==undefined&&lastpos.x===e.pageX&&lastpos.y===e.pageY||$(e.target).trigger("mousemove-filtered",e)}),this.dropdown.on("mousemove-filtered",".select2-results",this.bind(this.highlightUnderEvent)),this.dropdown.on("touchstart touchmove touchend",".select2-results",this.bind(function(event){this._touchEvent=!0,this.highlightUnderEvent(event)})),this.dropdown.on("touchmove",".select2-results",this.bind(this.touchMoved)),this.dropdown.on("touchstart touchend",".select2-results",this.bind(this.clearTouchMoved)),this.dropdown.on("click",this.bind(function(event){this._touchEvent&&(this._touchEvent=!1,this.selectHighlighted())})),function(threshold,element){var notify=debounce(threshold,function(e){element.trigger("scroll-debounced",e)});element.on("scroll",function(e){0<=indexOf(e.target,element.get())&&notify(e)})}(80,this.results),this.dropdown.on("scroll-debounced",".select2-results",this.bind(this.loadMoreIfNeeded)),$(this.container).on("change",".select2-input",function(e){e.stopPropagation()}),$(this.dropdown).on("change",".select2-input",function(e){e.stopPropagation()}),$.fn.mousewheel&&results.mousewheel(function(e,delta,deltaX,deltaY){var top=results.scrollTop();0<deltaY&&top-deltaY<=0?(results.scrollTop(0),killEvent(e)):deltaY<0&&results.get(0).scrollHeight-results.scrollTop()+deltaY<=results.height()&&(results.scrollTop(results.get(0).scrollHeight-results.height()),killEvent(e))}),installKeyUpChangeEvent(search),search.on("keyup-change input paste",this.bind(this.updateResults)),search.on("focus",function(){search.addClass("select2-focused")}),search.on("blur",function(){search.removeClass("select2-focused")}),this.dropdown.on("mouseup",".select2-results",this.bind(function(e){0<$(e.target).closest(".select2-result-selectable").length&&(this.highlightUnderEvent(e),this.selectHighlighted(e))})),this.dropdown.on("click mouseup mousedown touchstart touchend focusin",function(e){e.stopPropagation()}),this.nextSearchTerm=undefined,$.isFunction(this.opts.initSelection)&&(this.initSelection(),this.monitorSource()),null!==opts.maximumInputLength&&this.search.attr("maxlength",opts.maximumInputLength);var results,search,dim,disabled=opts.element.prop("disabled"),disabled=(this.enable(!(disabled=disabled===undefined?!1:disabled)),opts.element.prop("readonly"));this.readonly(disabled=disabled===undefined?!1:disabled),scrollBarDimensions=scrollBarDimensions||((disabled=$("<div class='select2-measure-scrollbar'></div>")).appendTo("body"),dim={width:disabled.width()-disabled[0].clientWidth,height:disabled.height()-disabled[0].clientHeight},disabled.remove(),dim),this.autofocus=opts.element.prop("autofocus"),opts.element.prop("autofocus",!1),this.autofocus&&this.focus(),this.search.attr("placeholder",opts.searchInputPlaceholder)},destroy:function(){var element=this.opts.element,select2=element.data("select2"),self=this;this.close(),element.length&&element[0].detachEvent&&element.each(function(){this.detachEvent("onpropertychange",self._sync)}),this.propertyObserver&&(this.propertyObserver.disconnect(),this.propertyObserver=null),this._sync=null,select2!==undefined&&(select2.container.remove(),select2.liveRegion.remove(),select2.dropdown.remove(),element.removeClass("select2-offscreen").removeData("select2").off(".select2").prop("autofocus",this.autofocus||!1),this.elementTabIndex?element.attr({tabindex:this.elementTabIndex}):element.removeAttr("tabindex"),element.show()),cleanupJQueryElements.call(this,"container","liveRegion","dropdown","results","search")},optionToData:function(element){return element.is("option")?{id:element.prop("value"),text:element.text(),element:element.get(),css:element.attr("class"),disabled:element.prop("disabled"),locked:equal(element.attr("locked"),"locked")||equal(element.data("locked"),!0)}:element.is("optgroup")?{text:element.attr("label"),children:[],element:element.get(),css:element.attr("class")}:void 0},sanitizeHtml:function(text){if(!text||"string"!=typeof text)return text;var validAttrs=["","background,cite,href,longdesc,src,xlink:href","accent-height,accumulate,additive,alphabetic,arabic-form,ascent,baseProfile,bbox,begin,by,calcMode,cap-height,class,color,color-rendering,content,cx,cy,d,dx,dy,descent,display,dur,end,fill,fill-rule,font-family,font-size,font-stretch,font-style,font-variant,font-weight,from,fx,fy,g1,g2,glyph-name,gradientUnits,hanging,height,horiz-adv-x,horiz-origin-x,ideographic,k,keyPoints,keySplines,keyTimes,lang,marker-end,marker-mid,marker-start,markerHeight,markerUnits,markerWidth,mathematical,max,min,offset,opacity,orient,origin,overline-position,overline-thickness,panose-1,path,pathLength,points,preserveAspectRatio,r,refX,refY,repeatCount,repeatDur,requiredExtensions,requiredFeatures,restart,rotate,rx,ry,slope,stemh,stemv,stop-color,stop-opacity,strikethrough-position,strikethrough-thickness,stroke,stroke-dasharray,stroke-dashoffset,stroke-linecap,stroke-linejoin,stroke-miterlimit,stroke-opacity,stroke-width,systemLanguage,target,text-anchor,to,transform,type,u1,u2,underline-position,underline-thickness,unicode,unicode-range,units-per-em,values,version,viewBox,visibility,width,widths,x,x-height,x1,x2,xlink:actuate,xlink:arcrole,xlink:role,xlink:show,xlink:title,xlink:type,xml:base,xml:lang,xml:space,xmlns,xmlns:xlink,y,y1,y2,zoomAndPan".toLowerCase(),"abbr,align,alt,axis,bgcolor,border,cellpadding,cellspacing,class,clear,color,cols,colspan,compact,coords,dir,face,headers,height,hreflang,hspace,ismap,lang,language,nohref,nowrap,rel,rev,rows,rowspan,rules,scope,scrolling,shape,size,span,start,style,summary,tabindex,target,title,type,valign,value,vspace,width",""].join(",");function sanitizeElement(elem){if(elem&&elem.nodeType===Node.ELEMENT_NODE){for(var invalidAttrs=[],i=0;i<elem.attributes.length;i++){var attr=elem.attributes[i].nodeName;validAttrs.indexOf(","+attr.toLowerCase()+",")<0&&invalidAttrs.push(attr)}for(i=0;i<invalidAttrs.length;i++)elem.removeAttribute(invalidAttrs[i]);for(i=0;i<elem.childNodes.length;i++)sanitizeElement(elem.childNodes[i])}}text=text.replace(/(<script\b[^>]*>[\s\S]*?<\/script>)/gim,"");for(var text=(new DOMParser).parseFromString(text,"text/html"),nodes=text.documentElement.childNodes,i=0;i<nodes.length;i++)sanitizeElement(nodes[i]);return text.getElementsByTagName("body")[0].innerHTML},prepareOpts:function(opts){var idKey,select,self=this,element=opts.element;if("select"===element.get(0).tagName.toLowerCase()&&(this.select=select=opts.element),select&&$.each(["id","multiple","ajax","query","createSearchChoice","initSelection","data","tags"],function(){if(this in opts)throw new Error("Option '"+this+"' is not allowed for Select2 when attached to a <select> element.")}),"function"!=typeof(opts=$.extend({},{populateResults:function(container,results,query){var id=this.opts.id,liveRegion=this.liveRegion,populate=function(results,container,depth){for(var result,compound,node,selectable,disabled,nodes=[],i=0,l=(results=opts.sortResults(results,container,query)).length;i<l;i+=1)selectable=!(disabled=!0===(result=results[i]).disabled)&&id(result)!==undefined,compound=result.children&&0<result.children.length,(node=$("<li></li>")).addClass("select2-results-dept-"+depth),node.addClass("select2-result"),node.addClass(selectable?"select2-result-selectable":"select2-result-unselectable"),disabled&&node.addClass("select2-disabled"),compound&&node.addClass("select2-result-with-children"),node.addClass(self.opts.formatResultCssClass(result)),node.attr("role","presentation"),(selectable=$(document.createElement("div"))).addClass("select2-result-label"),selectable.attr("id","select2-result-label-"+nextUid()),selectable.attr("role","option"),(disabled=opts.formatResult(result,selectable,query,self.opts.escapeMarkup))!==undefined&&(selectable.html(self.sanitizeHtml(disabled)),node.append(selectable)),compound&&((disabled=$("<ul></ul>")).attr("role","presentation"),disabled.addClass("select2-result-sub"),populate(result.children,disabled,depth+1),node.append(disabled)),node.data("select2-data",result),nodes.push(node[0]);container.append(nodes),liveRegion.text(opts.formatMatches(results.length))};populate(results,container,0)}},$.fn.select2.defaults,opts)).id&&(idKey=opts.id,opts.id=function(e){return e[idKey]}),$.isArray(opts.element.data("select2Tags"))){if("tags"in opts)throw"tags specified as both an attribute 'data-select2-tags' and in options of Select2 "+opts.element.attr("id");opts.tags=opts.element.data("select2Tags")}if(select?(opts.query=this.bind(function(query){var placeholderOption,data={results:[],more:!1},term=query.term,process=function(element,collection){var group;element.is("option")?query.matcher(term,element.text(),element)&&collection.push(self.optionToData(element)):element.is("optgroup")&&(group=self.optionToData(element),element.children().each2(function(i,elm){process(elm,group.children)}),0<group.children.length)&&collection.push(group)},children=element.children();(children=this.getPlaceholder()!==undefined&&0<children.length&&(placeholderOption=this.getPlaceholderOption())?children.not(placeholderOption):children).each2(function(i,elm){process(elm,data.results)}),query.callback(data)}),opts.id=function(e){return e.id}):"query"in opts||("ajax"in opts?((select=opts.element.data("ajax-url"))&&0<select.length&&(opts.ajax.url=select),opts.query=ajax.call(opts.element,opts.ajax)):"data"in opts?opts.query=local(opts.data):"tags"in opts&&(opts.query=tags(opts.tags),opts.createSearchChoice===undefined&&(opts.createSearchChoice=function(term){return{id:$.trim(term),text:$.trim(term)}}),opts.initSelection===undefined)&&(opts.initSelection=function(element,callback){var data=[];$(splitVal(element.val(),opts.separator)).each(function(){var obj={id:this,text:this},tags=opts.tags;$.isFunction(tags)&&(tags=tags()),$(tags).each(function(){if(equal(this.id,obj.id))return obj=this,!1}),data.push(obj)}),callback(data)})),"function"!=typeof opts.query)throw"query function not defined for Select2 "+opts.element.attr("id");if("top"===opts.createSearchChoicePosition)opts.createSearchChoicePosition=function(list,item){list.unshift(item)};else if("bottom"===opts.createSearchChoicePosition)opts.createSearchChoicePosition=function(list,item){list.push(item)};else if("function"!=typeof opts.createSearchChoicePosition)throw"invalid createSearchChoicePosition option must be 'top', 'bottom' or a custom function";return opts},monitorSource:function(){var observer,el=this.opts.element,self=this;el.on("change.select2",this.bind(function(e){!0!==this.opts.element.data("select2-change-triggered")&&this.initSelection()})),this._sync=this.bind(function(){var disabled=el.prop("disabled"),disabled=(this.enable(!(disabled=disabled===undefined?!1:disabled)),el.prop("readonly"));this.readonly(disabled=disabled===undefined?!1:disabled),syncCssClasses(this.container,this.opts.element,this.opts.adaptContainerCssClass),this.container.addClass(evaluate(this.opts.containerCssClass,this.opts.element)),syncCssClasses(this.dropdown,this.opts.element,this.opts.adaptDropdownCssClass),this.dropdown.addClass(evaluate(this.opts.dropdownCssClass,this.opts.element))}),el.length&&el[0].attachEvent&&el.each(function(){this.attachEvent("onpropertychange",self._sync)}),(observer=window.MutationObserver||window.WebKitMutationObserver||window.MozMutationObserver)!==undefined&&(this.propertyObserver&&(delete this.propertyObserver,this.propertyObserver=null),this.propertyObserver=new observer(function(mutations){$.each(mutations,self._sync)}),this.propertyObserver.observe(el.get(0),{attributes:!0,subtree:!1}))},triggerSelect:function(data){data=$.Event("select2-selecting",{val:this.id(data),object:data,choice:data});return this.opts.element.trigger(data),!data.isDefaultPrevented()},triggerChange:function(details){details=$.extend({},details=details||{},{type:"change",val:this.val()}),this.opts.element.data("select2-change-triggered",!0),this.opts.element.trigger(details),this.opts.element.data("select2-change-triggered",!1),this.opts.element.click(),this.opts.blurOnChange&&this.opts.element.blur()},isInterfaceEnabled:function(){return!0===this.enabledInterface},enableInterface:function(){var enabled=this._enabled&&!this._readonly;return enabled!==this.enabledInterface&&(this.container.toggleClass("select2-container-disabled",!enabled),this.close(),this.enabledInterface=enabled,!0)},enable:function(enabled){this._enabled!==(enabled=enabled===undefined||enabled)&&(this._enabled=enabled,this.opts.element.prop("disabled",!enabled),this.enableInterface())},disable:function(){this.enable(!1)},readonly:function(enabled){this._readonly!==(enabled=enabled!==undefined&&enabled)&&(this._readonly=enabled,this.opts.element.prop("readonly",enabled),this.enableInterface())},opened:function(){return!!this.container&&this.container.hasClass("select2-dropdown-open")},positionDropdown:function(){var above,changeDirection,$dropdown=this.dropdown,offset=this.container.offset(),height=this.container.outerHeight(!1),width=this.container.outerWidth(!1),dropHeight=$dropdown.outerHeight(!1),$window=$(window),windowWidth=$window.width(),windowHeight=$window.height(),viewPortRight=$window.scrollLeft()+windowWidth,windowHeight=$window.scrollTop()+windowHeight,dropTop=offset.top+height,dropLeft=offset.left,windowHeight=dropTop+dropHeight<=windowHeight,enoughRoomAbove=offset.top-dropHeight>=$window.scrollTop(),dropWidth=$dropdown.outerWidth(!1),enoughRoomOnRight=dropLeft+dropWidth<=viewPortRight;$dropdown.hasClass("select2-drop-above")?(above=!0,!enoughRoomAbove&&windowHeight&&(above=!(changeDirection=!0))):(above=!1,!windowHeight&&enoughRoomAbove&&(above=changeDirection=!0)),changeDirection&&($dropdown.hide(),offset=this.container.offset(),height=this.container.outerHeight(!1),width=this.container.outerWidth(!1),dropHeight=$dropdown.outerHeight(!1),viewPortRight=$window.scrollLeft()+windowWidth,$window.scrollTop(),dropTop=offset.top+height,enoughRoomOnRight=(dropLeft=offset.left)+(dropWidth=$dropdown.outerWidth(!1))<=viewPortRight,$dropdown.show(),this.focusSearch()),this.opts.dropdownAutoWidth?(windowHeight=$(".select2-results",$dropdown)[0],$dropdown.addClass("select2-drop-auto-width"),$dropdown.css("width",""),width<(dropWidth=$dropdown.outerWidth(!1)+(windowHeight.scrollHeight===windowHeight.clientHeight?0:scrollBarDimensions.width))?width=dropWidth:dropWidth=width,dropHeight=$dropdown.outerHeight(!1),enoughRoomOnRight=dropLeft+dropWidth<=viewPortRight):this.container.removeClass("select2-drop-auto-width"),"static"!==this.body.css("position")&&(dropTop-=(enoughRoomAbove=this.body.offset()).top,dropLeft-=enoughRoomAbove.left),changeDirection={left:dropLeft=enoughRoomOnRight?dropLeft:offset.left+this.container.outerWidth(!1)-dropWidth,width:width},above?(changeDirection.top=offset.top-dropHeight,changeDirection.top<5&&($window=(windowWidth=$dropdown.find(".select2-results")).height()+changeDirection.top-5,windowWidth.css("max-height",$window+"px"),changeDirection.top=5),changeDirection.bottom="auto",this.container.addClass("select2-drop-above"),$dropdown.addClass("select2-drop-above")):(changeDirection.top=dropTop,changeDirection.bottom="auto",this.container.removeClass("select2-drop-above"),$dropdown.removeClass("select2-drop-above")),changeDirection=$.extend(changeDirection,evaluate(this.opts.dropdownCss,this.opts.element)),$dropdown.css(changeDirection)},shouldOpen:function(){var event;return!this.opened()&&!1!==this._enabled&&!0!==this._readonly&&(event=$.Event("select2-opening"),this.opts.element.trigger(event),!event.isDefaultPrevented())},clearDropdownAlignmentPreference:function(){this.container.removeClass("select2-drop-above"),this.dropdown.removeClass("select2-drop-above")},open:function(){return!!this.shouldOpen()&&(this.opening(),$document.on("mousemove.select2Event",function(e){lastMousePosition.x=e.pageX,lastMousePosition.y=e.pageY}),!0)},opening:function(){var mask,cid=this.containerEventName,scroll="scroll."+cid,resize="resize."+cid,orient="orientationchange."+cid,that=(this.container.addClass("select2-dropdown-open").addClass("select2-container-active"),this.clearDropdownAlignmentPreference(),this.dropdown[0]!==this.body.children().last()[0]&&this.dropdown.detach().appendTo(this.body),0==(mask=$("#select2-drop-mask")).length&&((mask=$(document.createElement("div"))).attr("id","select2-drop-mask").attr("class","select2-drop-mask"),mask.hide(),mask.appendTo(this.body),mask.on("mousedown touchstart click",function(e){reinsertElement(mask);var dropdown=$("#select2-drop");0<dropdown.length&&((dropdown=dropdown.data("select2")).opts.selectOnBlur&&dropdown.selectHighlighted({noFocus:!0}),dropdown.close(),e.preventDefault(),e.stopPropagation())})),this.dropdown.prev()[0]!==mask[0]&&this.dropdown.before(mask),$("#select2-drop").removeAttr("id"),this.dropdown.attr("id","select2-drop"),mask.show(),this.positionDropdown(),this.dropdown.show(),this.positionDropdown(),this.dropdown.addClass("select2-drop-active"),this);this.container.parents().add(window).each(function(){$(this).on(resize+" "+scroll+" "+orient,function(e){that.opened()&&that.positionDropdown()})})},close:function(){var cid,scroll,resize,orient;this.opened()&&(cid=this.containerEventName,scroll="scroll."+cid,resize="resize."+cid,orient="orientationchange."+cid,this.container.parents().add(window).each(function(){$(this).off(scroll).off(resize).off(orient)}),this.clearDropdownAlignmentPreference(),$("#select2-drop-mask").hide(),this.dropdown.removeAttr("id"),this.dropdown.hide(),this.container.removeClass("select2-dropdown-open").removeClass("select2-container-active"),this.results.empty(),$document.off("mousemove.select2Event"),this.clearSearch(),this.search.removeClass("select2-active"),this.opts.element.trigger($.Event("select2-close")))},externalSearch:function(term){this.open(),this.search.val(term),this.updateResults(!1)},clearSearch:function(){},getMaximumSelectionSize:function(){return evaluate(this.opts.maximumSelectionSize,this.opts.element)},ensureHighlightVisible:function(){var child,hb,children,topOffset,results=this.results,index=this.highlight();index<0||(0==index?results.scrollTop(0):(children=this.findHighlightableChoices().find(".select2-result-label"),hb=(topOffset=((child=$(children[index])).offset()||{}).top||0)+child.outerHeight(!0),index===children.length-1&&0<(index=results.find("li.select2-more-results")).length&&(hb=index.offset().top+index.outerHeight(!0)),(children=results.offset().top+results.outerHeight(!0))<hb&&results.scrollTop(results.scrollTop()+(hb-children)),(index=topOffset-results.offset().top)<0&&"none"!=child.css("display")&&results.scrollTop(results.scrollTop()+index)))},findHighlightableChoices:function(){return this.results.find(".select2-result-selectable:not(.select2-disabled):not(.select2-selected)")},moveHighlight:function(delta){for(var choices=this.findHighlightableChoices(),index=this.highlight();-1<index&&index<choices.length;){var choice=$(choices[index+=delta]);if(choice.hasClass("select2-result-selectable")&&!choice.hasClass("select2-disabled")&&!choice.hasClass("select2-selected")){this.highlight(index);break}}},highlight:function(index){var choices=this.findHighlightableChoices();if(0===arguments.length)return indexOf(choices.filter(".select2-highlighted")[0],choices.get());(index=index>=choices.length?choices.length-1:index)<0&&(index=0),this.removeHighlight(),(choices=$(choices[index])).addClass("select2-highlighted"),this.search.attr("aria-activedescendant",choices.find(".select2-result-label").attr("id")),this.ensureHighlightVisible(),this.liveRegion.text(""),(index=choices.data("select2-data"))&&this.opts.element.trigger({type:"select2-highlight",val:this.id(index),choice:index})},removeHighlight:function(){this.results.find(".select2-highlighted").removeClass("select2-highlighted")},touchMoved:function(){this._touchMoved=!0},clearTouchMoved:function(){this._touchMoved=!1},countSelectableResults:function(){return this.findHighlightableChoices().length},highlightUnderEvent:function(event){var choices,event=$(event.target).closest(".select2-result-selectable");0<event.length&&!event.is(".select2-highlighted")?(choices=this.findHighlightableChoices(),this.highlight(choices.index(event))):0==event.length&&this.removeHighlight()},loadMoreIfNeeded:function(){var results=this.results,more=results.find("li.select2-more-results"),page=this.resultsPage+1,self=this,term=this.search.val(),context=this.context;0!==more.length&&more.offset().top-results.offset().top-results.height()<=this.opts.loadMorePadding&&(more.addClass("select2-active"),this.opts.query({element:this.opts.element,term:term,page:page,context:context,matcher:this.opts.matcher,callback:this.bind(function(data){self.opened()&&(self.opts.populateResults.call(this,results,data.results,{term:term,page:page,context:context}),self.postprocessResults(data,!1,!1),!0===data.more?(more.detach().appendTo(results).text(evaluate(self.opts.formatLoadMore,self.opts.element,page+1)),window.setTimeout(function(){self.loadMoreIfNeeded()},10)):more.remove(),self.positionDropdown(),self.resultsPage=page,self.context=data.context,this.opts.element.trigger({type:"select2-loaded",items:data}))})}))},tokenize:function(){},updateResults:function(initial){var queryNumber,search=this.search,results=this.results,opts=this.opts,self=this,term=search.val(),lastTerm=$.data(this.container,"select2-last-term");function postRender(){search.removeClass("select2-active"),self.positionDropdown(),results.find(".select2-no-results,.select2-selection-limit,.select2-searching").length?self.liveRegion.text(results.text()):self.liveRegion.text(self.opts.formatMatches(results.find(".select2-result-selectable").length))}function render(html){results.html(html),postRender()}!0!==initial&&lastTerm&&equal(term,lastTerm)||($.data(this.container,"select2-last-term",term),(!0===initial||!1!==this.showSearchInput&&this.opened())&&(queryNumber=++this.queryCount,1<=(lastTerm=this.getMaximumSelectionSize())&&(term=this.data(),$.isArray(term))&&term.length>=lastTerm&&checkFormatter(opts.formatSelectionTooBig,"formatSelectionTooBig")?render("<li class='select2-selection-limit'>"+evaluate(opts.formatSelectionTooBig,opts.element,lastTerm)+"</li>"):search.val().length<opts.minimumInputLength?(checkFormatter(opts.formatInputTooShort,"formatInputTooShort")?render("<li class='select2-no-results'>"+evaluate(opts.formatInputTooShort,opts.element,search.val(),opts.minimumInputLength)+"</li>"):render(""),initial&&this.showSearch&&this.showSearch(!0)):opts.maximumInputLength&&search.val().length>opts.maximumInputLength?checkFormatter(opts.formatInputTooLong,"formatInputTooLong")?render("<li class='select2-no-results'>"+evaluate(opts.formatInputTooLong,opts.element,search.val(),opts.maximumInputLength)+"</li>"):render(""):(opts.formatSearching&&0===this.findHighlightableChoices().length&&render("<li class='select2-searching'>"+evaluate(opts.formatSearching,opts.element)+"</li>"),search.addClass("select2-active"),this.removeHighlight(),(term=this.tokenize())!=undefined&&null!=term&&search.val(term),this.resultsPage=1,opts.query({element:opts.element,term:search.val(),page:this.resultsPage,context:null,matcher:opts.matcher,callback:this.bind(function(data){var def;queryNumber==this.queryCount&&(this.opened()?data.hasError!==undefined&&checkFormatter(opts.formatAjaxError,"formatAjaxError")?render("<li class='select2-ajax-error'>"+evaluate(opts.formatAjaxError,opts.element,data.jqXHR,data.textStatus,data.errorThrown)+"</li>"):(this.context=data.context===undefined?null:data.context,this.opts.createSearchChoice&&""!==search.val()&&(def=this.opts.createSearchChoice.call(self,search.val(),data.results))!==undefined&&null!==def&&self.id(def)!==undefined&&null!==self.id(def)&&0===$(data.results).filter(function(){return equal(self.id(this),self.id(def))}).length&&this.opts.createSearchChoicePosition(data.results,def),0===data.results.length&&checkFormatter(opts.formatNoMatches,"formatNoMatches")?render("<li class='select2-no-results'>"+evaluate(opts.formatNoMatches,opts.element,search.val())+"</li>"):(results.empty(),self.opts.populateResults.call(this,results,data.results,{term:search.val(),page:this.resultsPage,context:null}),!0===data.more&&checkFormatter(opts.formatLoadMore,"formatLoadMore")&&(results.append("<li class='select2-more-results'>"+opts.escapeMarkup(evaluate(opts.formatLoadMore,opts.element,this.resultsPage))+"</li>"),window.setTimeout(function(){self.loadMoreIfNeeded()},10)),this.postprocessResults(data,initial),postRender(),this.opts.element.trigger({type:"select2-loaded",items:data}))):this.search.removeClass("select2-active"))})}))))},cancel:function(){this.close()},blur:function(){this.opts.selectOnBlur&&this.selectHighlighted({noFocus:!0}),this.close(),this.container.removeClass("select2-container-active"),this.search[0]===document.activeElement&&this.search.blur(),this.clearSearch(),this.selection.find(".select2-search-choice-focus").removeClass("select2-search-choice-focus")},focusSearch:function(){var $el;($el=this.search)[0]!==document.activeElement&&window.setTimeout(function(){var el=$el[0],pos=$el.val().length;$el.focus(),(0<el.offsetWidth||0<el.offsetHeight)&&el===document.activeElement&&(el.setSelectionRange?el.setSelectionRange(pos,pos):el.createTextRange&&((pos=el.createTextRange()).collapse(!1),pos.select()))},0)},selectHighlighted:function(options){var index,data;this._touchMoved?this.clearTouchMoved():(index=this.highlight(),(data=this.results.find(".select2-highlighted").closest(".select2-result").data("select2-data"))?(this.highlight(index),this.onSelect(data,options)):options&&options.noFocus&&this.close())},getPlaceholder:function(){var placeholderOption;return this.opts.element.attr("placeholder")||this.opts.element.attr("data-placeholder")||this.opts.element.data("placeholder")||this.opts.placeholder||((placeholderOption=this.getPlaceholderOption())!==undefined?placeholderOption.text():undefined)},getPlaceholderOption:function(){var firstOption;if(this.select)return firstOption=this.select.children("option").first(),this.opts.placeholderOption!==undefined?"first"===this.opts.placeholderOption&&firstOption||"function"==typeof this.opts.placeholderOption&&this.opts.placeholderOption(this.select):""===$.trim(firstOption.text())&&""===firstOption.val()?firstOption:void 0},initContainerWidth:function(){var width=function(){var style,attrs,matches,i,l;if("off"===this.opts.width)return null;if("element"===this.opts.width)return 0===this.opts.element.outerWidth(!1)?"auto":this.opts.element.outerWidth(!1)+"px";if("copy"!==this.opts.width&&"resolve"!==this.opts.width)return $.isFunction(this.opts.width)?this.opts.width():this.opts.width;if((style=this.opts.element.attr("style"))!==undefined)for(i=0,l=(attrs=style.split(";")).length;i<l;i+=1)if(null!==(matches=attrs[i].replace(/\s/g,"").match(/^width:(([-+]?([0-9]*\.)?[0-9]+)(px|em|ex|%|in|cm|mm|pt|pc))/i))&&1<=matches.length)return matches[1];return"resolve"===this.opts.width?0<(style=this.opts.element.css("width")).indexOf("%")?style:0===this.opts.element.outerWidth(!1)?"auto":this.opts.element.outerWidth(!1)+"px":null}.call(this);null!==width&&this.container.css("width",width)}}),SingleSelect2=clazz(AbstractSelect2,{createContainer:function(){var labelAriaLabel=this.opts.element.attr("aria-label");return $(document.createElement("div")).attr({class:"select2-container"}).html(["<input class='select2-focusser select2-offscreen' type='text' role='combobox' aria-expanded='false' aria-controls='select2-drop'/>","<a href='javascript:void(0)' class='select2-choice' tabindex='-1' aria-hidden='true' role='button'>","   <span class='select2-chosen'>&#160;</span>","   <span class='select2-arrow' aria-hidden='true'><b></b></span>","</a>","<abbr role='button' class='select2-search-choice-close' tabindex='0' "+(this.opts.clearAriaLabel?"aria-label='"+this.opts.clearAriaLabel+"'":"")+"></abbr>","<div class='select2-drop select2-display-none'>","   <div class='select2-search'>","       <label for='' class='select2-offscreen'",labelAriaLabel?"aria-label='"+labelAriaLabel+"'":"","></label>","       <input type='text' autocomplete='off' autocorrect='off' autocapitalize='off' spellcheck='false' class='select2-input' role='combobox' aria-expanded='true'","       aria-autocomplete='list' />","   </div>","   <ul class='select2-results' role='listbox' aria-label='select2-results'>","   </ul>","</div>"].join(""))},enableInterface:function(){this.parent.enableInterface.apply(this,arguments)&&this.focusser.prop("disabled",!this.isInterfaceEnabled())},opening:function(){var el,range;0<=this.opts.minimumResultsForSearch&&this.showSearch(!0),this.parent.opening.apply(this,arguments),!1!==this.showSearchInput&&this.search.val(this.focusser.val()),this.opts.shouldFocusInput(this)&&(this.search.focus(),(el=this.search.get(0)).createTextRange?((range=el.createTextRange()).collapse(!1),range.select()):el.setSelectionRange&&(range=this.search.val().length,el.setSelectionRange(range,range))),""===this.search.val()&&this.nextSearchTerm!=undefined&&(this.search.val(this.nextSearchTerm),this.search.select()),this.focusser.prop("disabled",!0).val(""),this.updateResults(!0),this.opts.element.trigger($.Event("select2-open")),this.container.find("input")[0].ariaExpanded=!0},close:function(){this.opened()&&(this.parent.close.apply(this,arguments),this.focusser.prop("disabled",!1),this.opts.shouldFocusInput(this)&&this.focusser.focus(),this.container.find("input")[0].ariaExpanded=!1)},focus:function(){this.opened()?this.close():(this.focusser.prop("disabled",!1),this.opts.shouldFocusInput(this)&&this.focusser.focus())},isFocused:function(){return this.container.hasClass("select2-container-active")},cancel:function(){this.parent.cancel.apply(this,arguments),this.focusser.prop("disabled",!1),this.opts.shouldFocusInput(this)&&this.focusser.focus()},destroy:function(){$("label[for='"+this.focusser.attr("id")+"']").attr("for",this.opts.element.attr("id")),this.parent.destroy.apply(this,arguments),cleanupJQueryElements.call(this,"selection","focusser")},initContainer:function(){var selection,container=this.container,dropdown=this.dropdown,idSuffix=nextUid(),idSuffix=(this.opts.minimumResultsForSearch<0?this.showSearch(!1):this.showSearch(!0),this.selection=selection=container.find(".select2-choice"),this.focusser=container.find(".select2-focusser"),selection.find(".select2-chosen").attr("id","select2-chosen-"+idSuffix),this.focusser.attr("aria-labelledby","select2-chosen-"+idSuffix),this.results.attr("id","select2-results-"+idSuffix),this.search.attr("aria-owns","select2-results-"+idSuffix),this.opts.element.attr("aria-required")&&this.focusser.attr("aria-required",this.opts.element.attr("aria-required")),this.focusser.attr("id","s2id_autogen"+idSuffix),this.originalLabel=$("label[for='"+this.opts.element.attr("id")+"']"),this.originalLabel.length&&(this.originalLabel.attr("for",this.focusser.attr("id")),idSuffix=this.originalLabel.attr("id")||this.focusser.attr("id")+"-label",this.originalLabel.attr("id",idSuffix),this.focusser.attr("aria-labelledby",this.focusser.attr("aria-labelledby")+" "+this.originalLabel.attr("id"))),this.opts.element.attr("title")),clearValue=(this.opts.element.attr("title",idSuffix||this.originalLabel.text()),this.focusser.attr("tabindex",this.elementTabIndex),this.search.attr("id",this.focusser.attr("id")+"_search"),this.search.prev().text($("label[for='"+this.focusser.attr("id")+"']").text()).attr("for",this.search.attr("id")),this.search.on("keydown",this.bind(function(e){if(this.isInterfaceEnabled()&&229!=e.keyCode)if(e.which===KEY.PAGE_UP||e.which===KEY.PAGE_DOWN)killEvent(e);else switch(e.which){case KEY.UP:case KEY.DOWN:return this.moveHighlight(e.which===KEY.UP?-1:1),void killEvent(e);case KEY.ENTER:return this.selectHighlighted(),void killEvent(e);case KEY.TAB:return void this.selectHighlighted({noFocus:!0});case KEY.ESC:return this.cancel(e),void killEvent(e)}})),this.search.on("blur",this.bind(function(e){document.activeElement===this.body.get(0)&&e.relatedTarget&&window.setTimeout(this.bind(function(){this.opened()&&this.search.focus()}),0)})),this.focusser.on("keydown",this.bind(function(e){if(this.isInterfaceEnabled()&&e.which!==KEY.TAB&&!KEY.isControl(e)&&!KEY.isFunctionKey(e)&&e.which!==KEY.ESC){if(!1!==this.opts.openOnEnter||e.which!==KEY.ENTER)return e.which==KEY.DOWN||e.which==KEY.ENTER&&this.opts.openOnEnter?e.altKey||e.ctrlKey||e.shiftKey||e.metaKey?void 0:(this.open(),void killEvent(e)):void(e.which!=KEY.DELETE&&e.which!=KEY.BACKSPACE||(this.opts.allowClear&&this.clear(),killEvent(e)));killEvent(e)}})),installKeyUpChangeEvent(this.focusser),this.focusser.on("keyup-change input",this.bind(function(e){0<=this.opts.minimumResultsForSearch&&(e.stopPropagation(),this.opened()||this.open())})),this.bind(function(e){this.isInterfaceEnabled()&&(this.clear(),(e=e).preventDefault(),e.stopImmediatePropagation(),this.close(),this.selection.focus())}));container.on("mousedown touchstart","abbr",clearValue).on("keydown","abbr",function(e){switch(e.which){case KEY.ENTER:case KEY.SPACE:clearValue(e)}}),selection.on("mousedown touchstart",this.bind(function(e){reinsertElement(selection),this.container.hasClass("select2-container-active")||this.opts.element.trigger($.Event("select2-focus")),this.opened()?this.close():this.isInterfaceEnabled()&&this.open(),killEvent(e)})),dropdown.on("mousedown touchstart",this.bind(function(){this.opts.shouldFocusInput(this)&&this.search.focus()})),selection.on("focus",this.bind(function(e){killEvent(e)})),this.focusser.on("focus",this.bind(function(){this.container.hasClass("select2-container-active")||this.opts.element.trigger($.Event("select2-focus")),this.container.addClass("select2-container-active")})).on("blur",this.bind(function(){this.opened()||(this.container.removeClass("select2-container-active"),this.opts.element.trigger($.Event("select2-blur")))})),this.search.on("focus",this.bind(function(){this.container.hasClass("select2-container-active")||this.opts.element.trigger($.Event("select2-focus")),this.container.addClass("select2-container-active")})),this.initContainerWidth(),this.opts.element.addClass("select2-offscreen"),this.opts.element.attr("aria-hidden","true"),this.setPlaceholder()},clear:function(triggerChange){var evt,data=this.selection.data("select2-data");data&&(evt=$.Event("select2-clearing"),this.opts.element.trigger(evt),evt.isDefaultPrevented()||(evt=this.getPlaceholderOption(),this.opts.element.val(evt?evt.val():""),this.selection.find(".select2-chosen").empty(),this.selection.removeData("select2-data"),this.setPlaceholder(),!1!==triggerChange&&(this.opts.element.trigger({type:"select2-removed",val:this.id(data),choice:data}),this.triggerChange({removed:data}))))},initSelection:function(){var self;this.isPlaceholderOptionSelected()?(this.updateSelection(null),this.close(),this.setPlaceholder()):(self=this).opts.initSelection.call(null,this.opts.element,function(selected){selected!==undefined&&null!==selected&&(self.updateSelection(selected),self.close(),self.setPlaceholder(),self.nextSearchTerm=self.opts.nextSearchTerm(selected,self.search.val()))})},isPlaceholderOptionSelected:function(){var placeholderOption;return this.getPlaceholder()!==undefined&&((placeholderOption=this.getPlaceholderOption())!==undefined&&placeholderOption.prop("selected")||""===this.opts.element.val()||this.opts.element.val()===undefined||null===this.opts.element.val())},prepareOpts:function(){var opts=this.parent.prepareOpts.apply(this,arguments),self=this;return"select"===opts.element.get(0).tagName.toLowerCase()?opts.initSelection=function(element,callback){element=element.find("option").filter(function(){return this.selected&&!this.disabled});callback(self.optionToData(element))}:"data"in opts&&(opts.initSelection=opts.initSelection||function(element,callback){var id=element.val(),match=null;opts.query({matcher:function(term,text,el){var is_match=equal(id,opts.id(el));return is_match&&(match=el),is_match},callback:$.isFunction(callback)?function(){callback(match)}:$.noop})}),opts},getPlaceholder:function(){return this.select&&this.getPlaceholderOption()===undefined?undefined:this.parent.getPlaceholder.apply(this,arguments)},setPlaceholder:function(){var placeholder=this.getPlaceholder();!this.isPlaceholderOptionSelected()||placeholder===undefined||this.select&&this.getPlaceholderOption()===undefined||(this.selection.find(".select2-chosen").html(this.opts.escapeMarkup(placeholder)),this.selection.addClass("select2-default"),this.container.removeClass("select2-allowclear"))},postprocessResults:function(data,initial,noHighlightUpdate){var selected=0,self=this;this.findHighlightableChoices().each2(function(i,elm){if(equal(self.id(elm.data("select2-data")),self.opts.element.val()))return selected=i,!1}),!1!==noHighlightUpdate&&(!0===initial&&0<=selected?this.highlight(selected):this.highlight(0)),!0===initial&&0<=(noHighlightUpdate=this.opts.minimumResultsForSearch)&&this.showSearch(function countResults(results){var count=0;return $.each(results,function(i,item){item.children?count+=countResults(item.children):count++}),count}(data.results)>=noHighlightUpdate)},showSearch:function(showSearchInput){this.showSearchInput!==showSearchInput&&(this.showSearchInput=showSearchInput,this.dropdown.find(".select2-search").toggleClass("select2-search-hidden",!showSearchInput),this.dropdown.find(".select2-search").toggleClass("select2-offscreen",!showSearchInput),$(this.dropdown,this.container).toggleClass("select2-with-searchbox",showSearchInput))},onSelect:function(data,options){var old,oldData;this.triggerSelect(data)&&(old=this.opts.element.val(),oldData=this.data(),this.opts.element.val(this.id(data)),this.updateSelection(data),this.opts.element.trigger({type:"select2-selected",val:this.id(data),choice:data}),this.nextSearchTerm=this.opts.nextSearchTerm(data,this.search.val()),this.close(),options&&options.noFocus||!this.opts.shouldFocusInput(this)||this.focusser.focus(),equal(old,this.id(data))||this.triggerChange({added:data,removed:oldData}))},updateSelection:function(data){var formatted,container=this.selection.find(".select2-chosen");this.selection.data("select2-data",data),container.empty(),(formatted=null!==data?this.opts.formatSelection(data,container,this.opts.escapeMarkup):formatted)!==undefined&&container.append(formatted),(formatted=this.opts.formatSelectionCssClass(data,container))!==undefined&&container.addClass(formatted),this.selection.removeClass("select2-default"),this.opts.allowClear&&this.getPlaceholder()!==undefined&&this.container.addClass("select2-allowclear")},val:function(){var val,triggerChange=!1,data=null,self=this,oldData=this.data();if(0===arguments.length)return this.opts.element.val();if(val=arguments[0],1<arguments.length&&(triggerChange=arguments[1]),this.select)this.select.val(val).find("option").filter(function(){return this.selected}).each2(function(i,elm){return data=self.optionToData(elm),!1}),this.updateSelection(data),this.setPlaceholder(),triggerChange&&this.triggerChange({added:data,removed:oldData});else if(val||0===val){if(this.opts.initSelection===undefined)throw new Error("cannot call val() if initSelection() is not defined");this.opts.element.val(val),this.opts.initSelection(this.opts.element,function(data){self.opts.element.val(data?self.id(data):""),self.updateSelection(data),self.setPlaceholder(),triggerChange&&self.triggerChange({added:data,removed:oldData})})}else this.clear(triggerChange)},clearSearch:function(){this.search.val(""),this.focusser.val("")},data:function(value){var data,triggerChange=!1;if(0===arguments.length)return data=(data=this.selection.data("select2-data"))==undefined?null:data;1<arguments.length&&(triggerChange=arguments[1]),value?(data=this.data(),this.opts.element.val(value?this.id(value):""),this.updateSelection(value),triggerChange&&this.triggerChange({added:value,removed:data})):this.clear(triggerChange)}}),MultiSelect2=clazz(AbstractSelect2,{createContainer:function(){var labelAriaLabel=this.opts.element.attr("aria-label");return $(document.createElement("div")).attr({class:"select2-container select2-container-multi"}).html(["<ul class='select2-choices' role='presentation'>","  <li class='select2-search-field'>","    <label for='' class='select2-offscreen' ",labelAriaLabel?"aria-label='"+labelAriaLabel+"'":"","></label>","    <input type='text' role='combobox' autocomplete='off' autocorrect='off' autocapitalize='off' spellcheck='false' class='select2-input' aria-autocomplete='list' aria-controls='select2-drop'/>","  </li>","</ul>","<div class='select2-drop select2-drop-multi select2-display-none'>","   <ul class='select2-results' role='listbox' aria-label='select2-results'>","   </ul>","</div>"].join(""))},prepareOpts:function(){var opts=this.parent.prepareOpts.apply(this,arguments),self=this;return"select"===opts.element.get(0).tagName.toLowerCase()?opts.initSelection=function(element,callback){var data=[];element.find("option").filter(function(){return this.selected&&!this.disabled}).each2(function(i,elm){data.push(self.optionToData(elm))}),callback(data)}:"data"in opts&&(opts.initSelection=opts.initSelection||function(element,callback){var ids=splitVal(element.val(),opts.separator),matches=[];opts.query({matcher:function(term,text,el){var is_match=$.grep(ids,function(id){return equal(id,opts.id(el))}).length;return is_match&&matches.push(el),is_match},callback:$.isFunction(callback)?function(){for(var ordered=[],i=0;i<ids.length;i++)for(var id=ids[i],j=0;j<matches.length;j++){var match=matches[j];if(equal(id,opts.id(match))){ordered.push(match),matches.splice(j,1);break}}callback(ordered)}:$.noop})}),opts},selectChoice:function(choice){var selected=this.container.find(".select2-search-choice-focus");selected.length&&choice&&choice[0]==selected[0]||(selected.length&&this.opts.element.trigger("choice-deselected",selected),selected.removeClass("select2-search-choice-focus"),choice&&choice.length&&(this.close(),choice.addClass("select2-search-choice-focus"),this.opts.element.trigger("choice-selected",choice),this.liveRegion.text(choice.text())))},destroy:function(){$("label[for='"+this.search.attr("id")+"']").attr("for",this.opts.element.attr("id")),this.parent.destroy.apply(this,arguments),cleanupJQueryElements.call(this,"searchContainer","selection")},initContainer:function(){var selection,selector=".select2-choices",_this=(this.searchContainer=this.container.find(".select2-search-field"),this.selection=selection=this.container.find(selector),this);this.selection.on("click",".select2-search-choice:not(.select2-locked)",function(e){_this.search[0].focus(),_this.selectChoice($(this))}),this.search.attr("id","s2id_autogen"+nextUid()),this.results.attr("id",this.search.attr("id")+"_results"),this.search.attr("aria-owns",this.results.attr("id")),this.originalLabel=$("label[for='"+this.opts.element.attr("id")+"']"),this.originalLabel.length&&this.originalLabel.attr("for",this.search.attr("id")),this.opts.element.attr("aria-required")&&this.search.attr("aria-required",this.opts.element.attr("aria-required")),this.search.on("input paste",this.bind(function(){this.search.attr("placeholder")&&0==this.search.val().length||!this.isInterfaceEnabled()||this.opened()||this.open()})),this.search.attr("tabindex",this.elementTabIndex),this.keydowns=0,this.search.on("keydown",this.bind(function(e){if(this.isInterfaceEnabled()){++this.keydowns;var offset,length,sel,selected=selection.find(".select2-search-choice-focus"),prev=selected.prev(".select2-search-choice:not(.select2-locked)"),next=selected.next(".select2-search-choice:not(.select2-locked)"),el=(el=this.search,length=offset=0,"selectionStart"in(el=$(el)[0])?(offset=el.selectionStart,length=el.selectionEnd-offset):"selection"in document&&(el.focus(),sel=document.selection.createRange(),length=document.selection.createRange().text.length,sel.moveStart("character",-el.value.length),offset=sel.text.length-length),{offset:offset,length:length});if(!selected.length||e.which!=KEY.LEFT&&e.which!=KEY.RIGHT&&e.which!=KEY.BACKSPACE&&e.which!=KEY.DELETE&&e.which!=KEY.ENTER)if((e.which!==KEY.BACKSPACE||1!=this.keydowns)&&e.which!=KEY.LEFT||0!=el.offset||el.length){if(this.selectChoice(null),this.opened())switch(e.which){case KEY.UP:case KEY.DOWN:return this.moveHighlight(e.which===KEY.UP?-1:1),void killEvent(e);case KEY.ENTER:return this.selectHighlighted(),void killEvent(e);case KEY.TAB:return this.selectHighlighted({noFocus:!0}),void this.close();case KEY.ESC:return this.cancel(e),void killEvent(e)}if(e.which!==KEY.TAB&&!KEY.isControl(e)&&!KEY.isFunctionKey(e)&&e.which!==KEY.BACKSPACE&&e.which!==KEY.ESC){if(e.which===KEY.ENTER){if(!1===this.opts.openOnEnter)return;if(e.altKey||e.ctrlKey||e.shiftKey||e.metaKey)return}this.open(),e.which!==KEY.PAGE_UP&&e.which!==KEY.PAGE_DOWN||killEvent(e),e.which===KEY.ENTER&&killEvent(e)}}else this.selectChoice(selection.find(".select2-search-choice:not(.select2-locked)").last()),killEvent(e);else sel=selected,e.which==KEY.LEFT&&prev.length?sel=prev:e.which==KEY.RIGHT?sel=next.length?next:null:e.which===KEY.BACKSPACE?this.unselect(selected.first())&&(this.search.width(10),sel=prev.length?prev:next):e.which==KEY.DELETE?this.unselect(selected.first())&&(this.search.width(10),sel=next.length?next:null):e.which==KEY.ENTER&&(sel=null),this.selectChoice(sel),killEvent(e),sel&&sel.length||this.open()}})),this.search.on("keyup",this.bind(function(e){this.keydowns=0,this.resizeSearch()})),this.search.on("blur",this.bind(function(e){this.container.removeClass("select2-container-active"),this.search.removeClass("select2-focused"),this.selectChoice(null),this.opened()||this.clearSearch(),e.stopImmediatePropagation(),this.opts.element.trigger($.Event("select2-blur"))})),this.container.on("click",selector,this.bind(function(e){!this.isInterfaceEnabled()||0<$(e.target).closest(".select2-search-choice").length||(this.selectChoice(null),this.clearPlaceholder(),this.container.hasClass("select2-container-active")||this.opts.element.trigger($.Event("select2-focus")),this.open(),this.focusSearch(),e.preventDefault())})),this.container.on("focus",selector,this.bind(function(){this.isInterfaceEnabled()&&(this.container.hasClass("select2-container-active")||this.opts.element.trigger($.Event("select2-focus")),this.container.addClass("select2-container-active"),this.dropdown.addClass("select2-drop-active"),this.clearPlaceholder())})),this.initContainerWidth(),this.opts.element.addClass("select2-offscreen"),this.clearSearch()},enableInterface:function(){this.parent.enableInterface.apply(this,arguments)&&this.search.prop("disabled",!this.isInterfaceEnabled())},initSelection:function(){var self;""===this.opts.element.val()&&""===this.opts.element.text()&&(this.updateSelection([]),this.close(),this.clearSearch()),!this.select&&""===this.opts.element.val()||(self=this).opts.initSelection.call(null,this.opts.element,function(data){data!==undefined&&null!==data&&(self.updateSelection(data),self.close(),self.clearSearch())})},clearSearch:function(){var placeholder=this.getPlaceholder(),maxWidth=this.getMaxSearchWidth();placeholder!==undefined&&0===this.getVal().length&&!1===this.search.hasClass("select2-focused")?(this.search.val(placeholder).addClass("select2-default"),this.search.width(0<maxWidth?maxWidth:this.container.css("width"))):this.search.val("").width(10)},clearPlaceholder:function(){this.search.hasClass("select2-default")&&this.search.val("").removeClass("select2-default")},opening:function(){this.clearPlaceholder(),this.resizeSearch(),this.parent.opening.apply(this,arguments),this.focusSearch(),""===this.search.val()&&this.nextSearchTerm!=undefined&&(this.search.val(this.nextSearchTerm),this.search.select()),this.updateResults(!0),this.opts.shouldFocusInput(this)&&this.search.focus(),this.opts.element.trigger($.Event("select2-open"))},close:function(){this.opened()&&this.parent.close.apply(this,arguments)},focus:function(){this.close(),this.search.focus()},isFocused:function(){return this.search.hasClass("select2-focused")},updateSelection:function(data){var ids=[],filtered=[],self=this;$(data).each(function(){indexOf(self.id(this),ids)<0&&(ids.push(self.id(this)),filtered.push(this))}),data=filtered,this.selection.find(".select2-search-choice").remove(),$(data).each(function(){self.addSelectedChoice(this)}),self.postprocessResults()},tokenize:function(){var input=this.search.val();null!=(input=this.opts.tokenizer.call(this,input,this.data(),this.bind(this.onSelect),this.opts))&&input!=undefined&&(this.search.val(input),0<input.length)&&this.open()},onSelect:function(data,options){var describedString;this.triggerSelect(data)&&""!==data.text&&(this.addSelectedChoice(data),this.opts.element.trigger({type:"selected",val:this.id(data),choice:data}),this.nextSearchTerm=this.opts.nextSearchTerm(data,this.search.val()),this.clearSearch(),this.updateResults(),describedString=this.getVal().map(function(val){return this.search.attr("id")+"_choice_"+val},this).join(" "),this.search.attr("aria-describedby",describedString),!this.select&&this.opts.closeOnSelect||this.postprocessResults(data,!1,!0===this.opts.closeOnSelect),!this.opts.closeOnSelect&&0<this.countSelectableResults()?(this.search.width(10),this.resizeSearch(),0<this.getMaximumSelectionSize()&&this.val().length>=this.getMaximumSelectionSize()?this.updateResults(!0):this.nextSearchTerm!=undefined&&(this.search.val(this.nextSearchTerm),this.updateResults(),this.search.select()),this.positionDropdown()):(this.close(),this.search.width(10)),this.triggerChange({added:data}),options&&options.noFocus||this.focusSearch())},cancel:function(){this.close(),this.focusSearch()},addSelectedChoice:function(data){var formatted,enableChoice=!data.locked,enabledItem=$("<li class='select2-search-choice'>    <div></div>    <a href='#' role='button' class='select2-search-choice-close' tabindex='-1'></a></li>"),disabledItem=$("<li class='select2-search-choice select2-locked'><div></div></li>"),enabledItem=enableChoice?enabledItem:disabledItem,disabledItem=this.id(data),val=this.getVal();enabledItem.attr("id",this.search.attr("id")+"_choice_"+disabledItem),(formatted=this.opts.formatSelection(data,enabledItem.find("div"),this.opts.escapeMarkup))!=undefined&&enabledItem.find("div").replaceWith("<div>"+formatted+"</div>"),(formatted=this.opts.formatSelectionCssClass(data,enabledItem.find("div")))!=undefined&&enabledItem.addClass(formatted),enableChoice&&enabledItem.find(".select2-search-choice-close").on("mousedown",killEvent).on("click dblclick",this.bind(function(e){this.isInterfaceEnabled()&&(this.unselect($(e.target)),this.selection.find(".select2-search-choice-focus").removeClass("select2-search-choice-focus"),killEvent(e),this.close(),this.focusSearch())})).on("focus",this.bind(function(){this.isInterfaceEnabled()&&(this.container.addClass("select2-container-active"),this.dropdown.addClass("select2-drop-active"))})),enabledItem.data("select2-data",data),enabledItem.insertBefore(this.searchContainer),val.push(disabledItem),this.setVal(val)},unselect:function(selected){var data,index,val=this.getVal();if(0===(selected=selected.closest(".select2-search-choice")).length)throw"Invalid argument: "+selected+". Must be .select2-search-choice";if(data=selected.data("select2-data")){var evt=$.Event("select2-removing");if(evt.val=this.id(data),evt.choice=data,this.opts.element.trigger(evt),evt.isDefaultPrevented())return!1;for(;0<=(index=indexOf(this.id(data),val));)val.splice(index,1),this.setVal(val),this.select&&this.postprocessResults();return selected.remove(),this.opts.element.trigger({type:"select2-removed",val:this.id(data),choice:data}),this.triggerChange({removed:data}),!0}},postprocessResults:function(data,initial,noHighlightUpdate){var val=this.getVal(),choices=this.results.find(".select2-result"),compound=this.results.find(".select2-result-with-children"),self=this;choices.each2(function(i,choice){0<=indexOf(self.id(choice.data("select2-data")),val)&&(choice.addClass("select2-selected"),choice.find(".select2-result-selectable").addClass("select2-selected"))}),compound.each2(function(i,choice){choice.is(".select2-result-selectable")||0!==choice.find(".select2-result-selectable:not(.select2-selected)").length||choice.addClass("select2-selected")}),-1==this.highlight()&&!1!==noHighlightUpdate&&self.highlight(0),!this.opts.createSearchChoice&&0<!choices.filter(".select2-result:not(.select2-selected)").length&&(data&&(data.more||0!==this.results.find(".select2-no-results").length)||checkFormatter(self.opts.formatNoMatches,"formatNoMatches")&&this.results.append("<li class='select2-no-results'>"+evaluate(self.opts.formatNoMatches,self.opts.element,self.search.val())+"</li>"))},getMaxSearchWidth:function(){return this.selection.width()-getSideBorderPadding(this.search)},resizeSearch:function(){var maxWidth,e,style,sideBorderPadding=getSideBorderPadding(this.search);e=this.search,sizer||(style=e[0].currentStyle||window.getComputedStyle(e[0],null),(sizer=$(document.createElement("div")).css({position:"absolute",left:"-10000px",top:"-10000px",display:"none",fontSize:style.fontSize,fontFamily:style.fontFamily,fontStyle:style.fontStyle,fontWeight:style.fontWeight,letterSpacing:style.letterSpacing,textTransform:style.textTransform,whiteSpace:"nowrap"})).attr("class","select2-sizer"),$("body").append(sizer)),sizer.text(e.val()),style=sizer.width()+10,e=this.search.offset().left,(e=(e=(e=(maxWidth=this.selection.width())-(e-this.selection.offset().left)-sideBorderPadding)<style?maxWidth-sideBorderPadding:e)<40?maxWidth-sideBorderPadding:e)<=0&&(e=style),this.search.width(Math.floor(e))},getVal:function(){var val;return this.select?null===(val=this.select.val())?[]:val:splitVal(val=this.opts.element.val(),this.opts.separator)},setVal:function(val){var unique;this.select?this.select.val(val):(unique=[],$(val).each(function(){indexOf(this,unique)<0&&unique.push(this)}),this.opts.element.val(0===unique.length?"":unique.join(this.opts.separator)))},buildChangeDetails:function(old,current){for(var current=current.slice(0),old=old.slice(0),i=0;i<current.length;i++)for(var j=0;j<old.length;j++)equal(this.opts.id(current[i]),this.opts.id(old[j]))&&(current.splice(i,1),0<i&&i--,old.splice(j,1),j--);return{added:current,removed:old}},val:function(val,triggerChange){var oldData,self=this;if(0===arguments.length)return this.getVal();if((oldData=this.data()).length||(oldData=[]),val||0===val){if(this.setVal(val),this.select)this.opts.initSelection(this.select,this.bind(this.updateSelection)),triggerChange&&this.triggerChange(this.buildChangeDetails(oldData,this.data()));else{if(this.opts.initSelection===undefined)throw new Error("val() cannot be called if initSelection() is not defined");this.opts.initSelection(this.opts.element,function(data){var ids=$.map(data,self.id);self.setVal(ids),self.updateSelection(data),self.clearSearch(),triggerChange&&self.triggerChange(self.buildChangeDetails(oldData,self.data()))})}this.clearSearch()}else this.opts.element.val(""),this.updateSelection([]),this.clearSearch(),triggerChange&&this.triggerChange({added:this.data(),removed:oldData})},onSortStart:function(){if(this.select)throw new Error("Sorting of elements is not supported when attached to <select>. Attach to <input type='hidden'/> instead.");this.search.width(0),this.searchContainer.hide()},onSortEnd:function(){var val=[],self=this;this.searchContainer.show(),this.searchContainer.appendTo(this.searchContainer.parent()),this.resizeSearch(),this.selection.find(".select2-search-choice").each(function(){val.push(self.opts.id($(this).data("select2-data")))}),this.setVal(val),this.triggerChange()},data:function(values,triggerChange){var ids,old,self=this;if(0===arguments.length)return this.selection.children(".select2-search-choice").map(function(){return $(this).data("select2-data")}).get();old=this.data(),ids=$.map(values=values||[],function(e){return self.opts.id(e)}),this.setVal(ids),this.updateSelection(values),this.clearSearch(),triggerChange&&this.triggerChange(this.buildChangeDetails(old,this.data()))}}),$.fn.select2=function(){var select2,opts,value,multiple,args=Array.prototype.slice.call(arguments,0),allowedMethods=["val","destroy","opened","open","close","focus","isFocused","container","dropdown","onSortStart","onSortEnd","enable","disable","readonly","positionDropdown","data","search"],valueMethods=["opened","isFocused","container","dropdown"],propertyMethods=["val","data"],methodsMap={search:"externalSearch"};return this.each(function(){if(0===args.length||"object"==typeof args[0])(opts=0===args.length?{}:$.extend({},args[0])).element=$(this),"select"===opts.element.get(0).tagName.toLowerCase()?multiple=opts.element.prop("multiple"):(multiple=opts.multiple||!1,"tags"in opts&&(opts.multiple=multiple=!0)),(select2=new(multiple?window.Select2.class.multi:window.Select2.class.single)).init(opts);else{if("string"!=typeof args[0])throw"Invalid arguments to select2 plugin: "+args;if(indexOf(args[0],allowedMethods)<0)throw"Unknown method: "+args[0];if(value=undefined,(select2=$(this).data("select2"))!==undefined)return opts=args[0],value="container"===opts?select2.container:"dropdown"===opts?select2.dropdown:select2[opts=methodsMap[opts]?methodsMap[opts]:opts].apply(select2,args.slice(1)),!(0<=indexOf(args[0],valueMethods)||0<=indexOf(args[0],propertyMethods)&&1==args.length)&&void 0}}),value===undefined?this:value},$.fn.select2.defaults={width:"copy",loadMorePadding:0,closeOnSelect:!0,openOnEnter:!0,containerCss:{},dropdownCss:{},containerCssClass:"",dropdownCssClass:"",formatResult:function(result,container,query,escapeMarkup){var markup=[];return markMatch(result.text,query.term,markup,escapeMarkup),markup.join("")},formatSelection:function(data,container,escapeMarkup){return data?escapeMarkup(data.text):undefined},sortResults:function(results,container,query){return results},formatResultCssClass:function(data){return data.css},formatSelectionCssClass:function(data,container){return undefined},minimumResultsForSearch:0,minimumInputLength:0,maximumInputLength:null,maximumSelectionSize:0,id:function(e){return e==undefined?null:e.id},matcher:function(term,text){return 0<=stripDiacritics(""+text).toUpperCase().indexOf(stripDiacritics(""+term).toUpperCase())},separator:",",tokenSeparators:[],tokenizer:function(input,selection,selectCallback,opts){var token,index,i,l,separator,original=input,dupe=!1;if(!opts.createSearchChoice||!opts.tokenSeparators||opts.tokenSeparators.length<1)return undefined;for(;;){for(index=-1,i=0,l=opts.tokenSeparators.length;i<l&&(separator=opts.tokenSeparators[i],!(0<=(index=input.indexOf(separator))));i++);if(index<0)break;if(token=input.substring(0,index),input=input.substring(index+separator.length),0<token.length&&(token=opts.createSearchChoice.call(this,token,selection))!==undefined&&null!==token&&opts.id(token)!==undefined&&null!==opts.id(token)){for(dupe=!1,i=0,l=selection.length;i<l;i++)if(equal(opts.id(token),opts.id(selection[i]))){dupe=!0;break}dupe||selectCallback(token)}}return original!==input?input:void 0},escapeMarkup:defaultEscapeMarkup,blurOnChange:!1,selectOnBlur:!1,adaptContainerCssClass:function(c){return c},adaptDropdownCssClass:function(c){return null},nextSearchTerm:function(selectedObject,currentSearchTerm){return undefined},searchInputPlaceholder:"",createSearchChoicePosition:"top",shouldFocusInput:function(instance){return!(("ontouchstart"in window||0<navigator.msMaxTouchPoints)&&instance.opts.minimumResultsForSearch<0)}},$.fn.select2.locales=[],$.fn.select2.locales.en={formatMatches:function(matches){return 1===matches?"One result is available, press enter to select it.":matches+" results are available, use up and down arrow keys to navigate."},formatNoMatches:function(){return"No matches found"},formatAjaxError:function(jqXHR,textStatus,errorThrown){return"Loading failed"},formatInputTooShort:function(input,min){min-=input.length;return"Please enter "+min+" or more character"+(1==min?"":"s")},formatInputTooLong:function(input,max){input=input.length-max;return"Please delete "+input+" character"+(1==input?"":"s")},formatSelectionTooBig:function(limit){return"You can only select "+limit+" item"+(1==limit?"":"s")},formatLoadMore:function(pageNumber){return"Loading more results…"},formatSearching:function(){return"Searching…"}},$.extend($.fn.select2.defaults,$.fn.select2.locales.en),$.fn.select2.ajaxDefaults={transport:$.ajax,params:{type:"GET",cache:!1,dataType:"json"}},window.Select2={query:{ajax:ajax,local:local,tags:tags},util:{debounce:debounce,markMatch:markMatch,escapeMarkup:defaultEscapeMarkup,stripDiacritics:stripDiacritics},class:{abstract:AbstractSelect2,single:SingleSelect2,multi:MultiSelect2}})}(jQuery);
/*! RESOURCE: /scripts/select2_translations.js */
(function($) {
  if (!$ || !window.GwtMessage) {
    return;
  }
  function getMessage() {
    var gwt = new GwtMessage();
    return gwt.getMessage.apply(gwt, arguments);
  }
  $.extend($.fn.select2.defaults, {
    formatMatches: function(matches) {
      return getMessage("{0} result(s) available, use up and down arrow keys to navigate and enter to select", matches);
    },
    formatNoMatches: function() {
      return getMessage("No matches found");
    },
    formatAjaxError: function(jqXHR, textStatus, errorThrown) {
      return getMessage("Loading failed");
    },
    formatInputTooShort: function(input, min) {
      var n = min - input.length;
      return getMessage("Please enter {0} or more character(s)", n);
    },
    formatInputTooLong: function(input, max) {
      var n = input.length - max;
      return getMessage("Please delete {0} character(s)", n);
    },
    formatSelectionTooBig: function(limit) {
      return getMessage("You can only select {0} item(s)", limit);
    },
    formatLoadMore: function(pageNumber) {
      return getMessage("Loading more results…");
    },
    formatSearching: function() {
      return getMessage("Searching…");
    }
  });
})(jQuery);
;
/*! RESOURCE: /scripts/heisenberg/custom/selects.js */
jQuery(function($) {
	"use strict";
	window.NOW = window.NOW || {};
	var $select2 = $('select.select2, select.sn-select-basic').not('select[readonly]');
	$select2
		.each(function() {
			var required = $(this).prop('required');
			if (required)
				$(this).addClass('required');
		})
		.select2();
	$(window).bind('blur', function() {
		$select2.select2('close');
	});
});
;
/*! RESOURCE: /scripts/heisenberg/custom/tabs.js */
(function($) {
	"use strict";
	$.fn.tabs = (function() {
		return function() {
			var $elem = this;
			var api = {};
			$elem.data('sn.tabs', api);
			attachTabClickHandler($elem);
			attachFocusHandler($elem);
			attachKeyboardHandler($elem);
		};
		function attachTabClickHandler($elem) {
			$elem.on('click', 'li, [data-toggle=tab], [data-toggle=segmented]', function (e) {
				var $el = $(this);
				var $tabLi, $tabTrigger;
				if ($el.is('li')) {
					$tabLi = $el;
					$tabTrigger = $el.find('[data-toggle]').first();
				} else {
					$tabTrigger = $el;
					$tabLi = $el.closest('li');
				}
				if ($tabLi.hasClass('disabled'))
					return;
				var $selectedTab = $tabLi.siblings('.active');
				var $selectedTabTrigger = $selectedTab.find('[data-toggle]').first();
				setTabDisplay($selectedTab, $selectedTabTrigger, false);
				setTabDisplay($tabLi, $tabTrigger, true);
				e.preventDefault();
			})
		}
		function attachFocusHandler($elem) {
			$elem.on('focusin focusout', '[data-toggle=tab], [data-toggle=segmented]', function(e) {
				var $el = $(this).closest('li');
				switch (e.type) {
					case 'focusin':
						$el.addClass('focus');
						break;
					case 'focusout':
						$el.removeClass('focus');
						break;
				}
			})
		}
		function attachKeyboardHandler($elem) {
			if ($elem.attr('aria-orientation') !== 'vertical') return;
			$elem.on('keydown', '[data-toggle=tab], [data-toggle=segmented]', function(e) {
				if (e.keyCode === 38 || e.keyCode === 40) {
					var $currTab = $(this).closest('li');
					var $newTab = e.keyCode === 38 ? $currTab.prev() : $currTab.next();
					if (!$newTab.length) return;
					var $newTabTrigger = $newTab.find('[data-toggle]').first();
					var $selectedTab = $newTab.siblings('.active');
					var $selectedTabTrigger = $selectedTab.find('[data-toggle]').first();
					$newTabTrigger.focus();
					setTabDisplay($selectedTab, $selectedTabTrigger, false);
					setTabDisplay($newTab, $newTabTrigger, true);
					e.preventDefault();
				}
			})
		}
		function setTabDisplay($tabLi, $tabTrigger, display) {
			$tabTrigger.attr('aria-selected', display ? 'true' : 'false');
			var selector = $tabTrigger.data('tab-target') || $tabTrigger.attr('href');
selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '');
			var $tabpanel = $(selector);
			$tabpanel.attr('aria-hidden', display ? 'false' : 'true');
			if (display) {
				$tabLi.addClass('active justselected');
				$tabpanel.addClass('active');
				$tabLi.one('focusout', function () {
					$tabLi.removeClass('justselected');
				})
			} else {
				$tabLi.removeClass('active');
				$tabpanel.removeClass('active');
			}
		}
	})();
	$(function() {
		$('.sn-tabs-basic').each(function() {
			var $this = $(this);
			if (!$this.data('sn.tabs'))
				$this.tabs();
		});
	});
})(jQuery);
;
/*! RESOURCE: /scripts/heisenberg/custom/tables.js */
(function($) {
	"use strict";
	$.fn.tableDetailRowHover = function() {
		this.each(function() {
			$(this)
				.on('mouseenter mouseleave', 'tr', function(evt) {
					var row = getTargetAdjRow($(this));
					evt.type == 'mouseenter'
						? row.addClass('hover') : row.removeClass('hover');
				});
		})
	}
	function getTargetAdjRow(row) {
		return row.hasClass('detail-row') ? row.prev() : row.next();
	}
})(jQuery);
jQuery(function($) {
	"use strict";
	$('.detail-row:nth-child(2)').closest('table.table').addClass('table-detail-row');
	$('.table-hover.table-detail-row').tableDetailRowHover();
});
;
/*! RESOURCE: /scripts/lib/tabbable/tabbable.js */
(function() {
	window.tabbable = function(el, selectorList) {
		var basicTabbables = [];
		var orderedTabbables = [];
		var isHidden = createIsHidden();
		var candidates = el.querySelectorAll(selectorList || 'input, select, a[href], textarea, button, [tabindex], [contenteditable]:not([contenteditable="false"])');
		var candidate, candidateIndex;
		for (var i = 0, l = candidates.length; i < l; i++) {
			candidate = candidates[i];
			candidateIndex = getTabindex(candidate);
			if (
				candidateIndex < 0
				|| (candidate.tagName === 'INPUT' && candidate.type === 'hidden')
				|| candidate.disabled
				|| isHidden(candidate)
			) {
				continue;
			}
			if (candidateIndex === 0) {
				basicTabbables.push(candidate);
			} else {
				orderedTabbables.push({
					tabIndex: candidateIndex,
					node: candidate,
				});
			}
		}
		var tabbableNodes = orderedTabbables
			.sort(function(a, b) {
				return a.tabIndex - b.tabIndex;
			})
			.map(function(a) {
				return a.node
			});
		Array.prototype.push.apply(tabbableNodes, basicTabbables);
		return tabbableNodes;
	}
	function isContentEditable(node) {
		return node.contentEditable === "true";
	}
	function getTabindex(node) {
		var tabindexAttr = parseInt(node.getAttribute('tabindex'), 10);
		if (!isNaN(tabindexAttr)) return tabindexAttr;
		if (isContentEditable(node)) return 0;
		return node.tabIndex; 
	}
	function createIsHidden() {
		var nodeCache = [];
		return function isHidden(node) {
			if (node === document.documentElement || !node.tagName) return false;
			for (var i = 0, length = nodeCache.length; i < length; i++) {
				if (nodeCache[i][0] === node) return nodeCache[i][1];
			}
			var result = false;
			var style = window.getComputedStyle(node);
			if (style.visibility === 'hidden' || style.display === 'none') {
				result = true;
			} else if (node.parentNode) {
				result = isHidden(node.parentNode);
			}
			nodeCache.push([node, result]);
			return result;
		}
	}
})();
;
/*! RESOURCE: /scripts/lib/focus-trap/focus-trap.js */
(function() {
	var listeningFocusTrap = null;
	function focusTrap(element, userOptions) {
		var tabbableNodes = [];
		var nodeFocusedBeforeActivation = null;
		var active = false;
		var container = (typeof element === 'string')
			? document.querySelector(element)
			: element;
		var config = userOptions || {};
		config.returnFocusOnDeactivate = (userOptions && userOptions.returnFocusOnDeactivate != undefined)
			? userOptions.returnFocusOnDeactivate
			: true;
		config.escapeDeactivates = (userOptions && userOptions.escapeDeactivates != undefined)
			? userOptions.escapeDeactivates
			: true;
		var trap = {
			activate: activate,
			deactivate: deactivate,
			pause: removeListeners,
			unpause: addListeners
		};
		return trap;
		function activate(activateOptions) {
			var defaultedActivateOptions = {
				onActivate: (activateOptions && activateOptions.onActivate !== undefined)
					? activateOptions.onActivate
					: config.onActivate,
			};
			active = true;
			nodeFocusedBeforeActivation = getFocusedElement();
			if (defaultedActivateOptions.onActivate) {
				defaultedActivateOptions.onActivate();
			}
			addListeners();
			return trap;
		}
		function deactivate(deactivateOptions) {
			var defaultedDeactivateOptions = {
				returnFocus: (deactivateOptions && deactivateOptions.returnFocus != undefined)
					? deactivateOptions.returnFocus
					: config.returnFocusOnDeactivate,
				returnFocusTo: deactivateOptions && deactivateOptions.returnFocusTo,	
				onDeactivate: (deactivateOptions && deactivateOptions.onDeactivate !== undefined)
					? deactivateOptions.onDeactivate
					: config.onDeactivate,
			};
			removeListeners();
			if (defaultedDeactivateOptions.onDeactivate) {
				defaultedDeactivateOptions.onDeactivate();
			}
			if (defaultedDeactivateOptions.returnFocus) {
				setTimeout(function() {
					tryFocus(defaultedDeactivateOptions.returnFocusTo || nodeFocusedBeforeActivation);
				}, 0);
			}
			active = false;
			return this;
		}
		function addListeners() {
			if (!active) return;
			if (listeningFocusTrap) {
				listeningFocusTrap.pause();
			}
			listeningFocusTrap = trap;
			updateTabbableNodes();
			tryFocus(firstFocusNode());
			document.addEventListener('focus', checkFocus, true);
			document.addEventListener('click', checkClick, true);
			document.addEventListener('mousedown', checkPointerDown, true);
			document.addEventListener('touchstart', checkPointerDown, true);
			document.addEventListener('keydown', checkKey, true);
			return trap;
		}
		function removeListeners() {
			if (!active || !listeningFocusTrap) return;
			document.removeEventListener('focus', checkFocus, true);
			document.removeEventListener('click', checkClick, true);
			document.removeEventListener('mousedown', checkPointerDown, true);
			document.removeEventListener('touchstart', checkPointerDown, true);
			document.removeEventListener('keydown', checkKey, true);
			listeningFocusTrap = null;
			return trap;
		}
		function firstFocusNode() {
			var node;
			if (!config.initialFocus) {
				node = tabbableNodes[0];
				if (!node) {
					throw new Error('You can\'t have a focus-trap without at least one focusable element');
				}
				return node;
			}
			node = (typeof config.initialFocus === 'string')
				? document.querySelector(config.initialFocus)
				: config.initialFocus;
			if (!node) {
				throw new Error('`initialFocus` refers to no known node');
			}
			return node;
		}
		function checkPointerDown(e) {
			if (config.clickOutsideDeactivates) {
				deactivate({ returnFocus: false });
			}
		}
		function checkClick(e) {
			if (config.clickOutsideDeactivates) return;
			var composedPath = getEventPath(e);
			if (composedPath.indexOf(container) >= 0) return;
			e.preventDefault();
			e.stopImmediatePropagation();
		}
		function checkFocus(e) {
			if (config.focusOutsideDeactivates === false) return;
			var composedPath = getEventPath(e);
			var target = composedPath[0];
			if (composedPath.indexOf(container) >= 0) return;
			e.preventDefault();
			e.stopImmediatePropagation();
			target.blur();
		}
		function checkKey(e) {
			if (e.key === 'Tab' || e.keyCode === 9) {
				handleTab(e);
			}
			if (config.escapeDeactivates !== false && isEscapeEvent(e)) {
				deactivate();
			}
		}
		function handleTab(e) {
			e.preventDefault();
			updateTabbableNodes();
			var target = getEventPath(e)[0];
			var currentFocusIndex = tabbableNodes.indexOf(target);
			var lastTabbableNode = tabbableNodes[tabbableNodes.length - 1];
			var firstTabbableNode = tabbableNodes[0];
			if (e.shiftKey) {
				if (target === firstTabbableNode || tabbableNodes.indexOf(target) === -1) {
					return tryFocus(lastTabbableNode);
				}
				return tryFocus(tabbableNodes[currentFocusIndex - 1]);
			}
			if (target === lastTabbableNode) return tryFocus(firstTabbableNode);
			tryFocus(tabbableNodes[currentFocusIndex + 1]);
		}
		function updateTabbableNodes() {
			tabbableNodes = tabbable(container);
		}
	}
	function isEscapeEvent(e) {
		return e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27;
	}
	function tryFocus(node) {
		if (!node || !node.focus) return;
		node.focus();
		if (node.tagName.toLowerCase() === 'input') {
			node.select();
		}
	}
	function getFocusedElement() {
		var activeElement = document.activeElement;
		if (!activeElement || activeElement === document.body) {
			return;
		}
		var getShadowActiveElement = function(element) {
			if (element.shadowRoot && element.shadowRoot.activeElement) {
				element = getShadowActiveElement(element.shadowRoot.activeElement);
			}
			return element;
		};
		return getShadowActiveElement(activeElement);
	}
	function getEventPath(evt) {
		return evt.path || (evt.composedPath && evt.composedPath()) || composedPath(evt.target);
	}
	
	function composedPath(el) {
		var path = [];
		while (el) {
			if (el.shadowRoot) {
				if (el.shadowRoot.activeElement) {
					path.push(el.shadowRoot.activeElement);
				}
				path.push(el.shadowRoot);
			}
			path.push(el);
			if (el.tagName === 'HTML') {
				path.push(document);
				path.push(window);
				break;
			}
			el = el.parentElement;
		}
		return path;
	}
	window.focusTrap = focusTrap;
})();
;
/*! RESOURCE: /scripts/heisenberg/custom/accessibility.js */
jQuery(function($) {
	if (!window.WeakMap)
		return;
	window.NOW = window.NOW || {};
	if (window.NOW.accessibilityJSLoaded) {
		return;
	}
	window.NOW.accessibilityJSLoaded = true;
	var $document = $(document),
		store = new WeakMap();
	$document.on('show.bs.modal', function(evt) {
		var modal = evt.target,
			previouslyFocusedElement = document.activeElement;
		if (hasOptions(modal))
			return;
		createOptions(modal);
		rememberTrigger(modal, previouslyFocusedElement);
	});
	$document.on('hidden.bs.modal', function(evt) {
		var modal = evt.target;
		restoreTriggerFocus(modal);
		destroyOptions(modal);
	});
	function createOptions(modal) {
		store.set(modal, {});
	}
	function hasOptions(modal) {
		return !!store.get(modal);
	}
	function destroyOptions(modal) {
		store.delete(modal);
	}
	function getOption(modal, key) {
		var options = store.get(modal);
		return options && options[key];
	}
	function setOption(modal, key, value) {
		var options = store.get(modal);
		if (options) {
			options[key] = value;
		}
	}
	function rememberTrigger(modal, triggerElement) {
		setOption(modal, 'trigger-element', triggerElement);
	}
	function restoreTriggerFocus(modal) {
		var $target = $(getOption(modal, 'trigger-element'));
		var isFocusable = function($el) {
			if ($el.filter(':visible').length > 0) {
				return $el[0].tabIndex > -1;
			}
			return false;
		}
		var tryFocus = function(el) {
			var $el = $(el);
			if (isFocusable($el)) {
				$el.focus();
				return true;
			}
			return false;
		}
		do {
			if (tryFocus($target) || tryFocus($target.data('menu-trigger'))) {
				return;
			}
			$target = $target.parent();
		} while ($target.length > 0);
	}
});
;
;
/*! RESOURCE: /scripts/heisenberg/heisenberg_all.js */
