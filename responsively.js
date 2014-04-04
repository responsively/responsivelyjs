/**
 * @license
 * responsively.js
 * Copyright 2014 Mark Bradley, Ted Halmrast
 * Available under MIT license <http://responsivelyjs.org/license>
 */
;(function(window) {

  /*

     /.  lite menu

     /.  genericize the menu classes/options so it isn't limited to bootstrap menus

     /.  document menu options

     /.  render the overflow dropdown only once, at the end

   */

  function result(object, property) {
    if (object == null)
      return void 0;

    var value = object[property];
    return typeof value === 'function' ? value.call( object ) : value;
  }

  // IE8ism
  function trim( s ) {
    return s.replace(/^\s+|\s+$/g, ''); 
  }

  function linkRenderer( m, opts ) {

    var html = '';

    var classes = '';

    if ( opts.submenu )
      classes += ' dropdown-toggle';

    html += '<a';
    var mhref = result( m, 'href' );

    if ( mhref )
      html += ' href="' + mhref + '"';

    var mtarget = result( m, 'target' );
    if ( mtarget )
      html += ' target="' + mtarget + '"';

    var mclasses = result( m, 'classes' );
    if ( mclasses )
      classes += ' ' + mclasses;

    if ( classes )
      html += ' class="' + trim( classes ) + '"';

    var mstyle = result( m, 'style' );
    if ( mstyle )
      html += ' style="' + mstyle + '"';

    if ( opts.submenu )
      html += ' data-toggle="dropdown"';

    html += '>';

    var micon = result( m, 'icon' );
    if ( micon ) {
      if ( micon[0] === '<' )
        html += micon;
      else
        html += '<i class="' + micon + '"/> ';
    }

    if ( !m.icon || !opts.icons )
      html +=  result( m, 'label' );

    var mextra = result( m, 'extra' );
    if ( mextra )
      html += mextra;

    if ( opts.submenu )
      html += '&nbsp;<i class="fa fa-caret-down" style="color:#666;"/>';

    html += '</a>';

    return html;
  }

  function menuItemRenderer( item, opts ) {
    var html = '';

    var el = result( item, 'element' );
    if ( el === undefined )
      el = 'li';

    if ( el ) html += '<' + el + '>';
    html += linkRenderer( item, opts );
    if ( el ) html += '</' + el + '>';

    return html;
  }

  function menuRenderer( items, opts ) {
    var html      = '',
        sepNeeded = false;

    for ( var i=0, ilen=items.length; i<ilen; i++ ) {
      var item = items[ i ];

      if ( item === '-' ) {
        sepNeeded = true;
      } else if ( !result( item, 'hide' ) ) {
        if ( sepNeeded ) {
          html += '<li><hr/></li>';
          sepNeeded = false;
        }

        html += menuItemRenderer( item, opts );
      }
    }

    return html;
  }

  function responsively( opts ) {

    var p            = $( result( opts, 'parent' ) ),
        rules        = result( opts, 'rules' ),
        constrain    = result( opts, 'constrain' ),
        tHeight      = result( opts, 'height' ),
        menuOpts     = result( opts, 'menu' ),
        menuOverflow = menuOpts && result( menuOpts, 'overflow' ),
        menuAnchor   = menuOpts && result( menuOpts, 'a' ),

        cel; // cel = Constrained ELement

    var outer = result( opts, 'outer' );
    if ( outer )
      p.replaceWith( outer );

    var inner = result( opts, 'inner' );
    if ( inner )
      p.html( inner );

    p = $( opts.parent );

    var r = {
      render: function() {
        r.level = 0;
        r.icons = false;
        r.menuLimit = ( menuOverflow && result( menuOverflow, 'limit' ) ) || 8; 

        cel = constrain ? p.find( constrain ) : p;
        var width = cel.width();

        if ( !tHeight )
          tHeight = cel.height();

        //console.log( 'est width:' + width + ' target height:' + tHeight );

        this.update();
      },

      update: function() {
        cel.css( 'visibility', 'hidden' );

        for (;;) {

          //console.log( 'processing level ' + r.level + " cel.height:" + cel.height() + " tHeight:" + tHeight );

          if ( !r.level ) {
            if ( menuOpts ) {
              // TODO:  rerender menu item until it fits ... THEN render overflow at the end ...
              $( menuAnchor ).html( r.menu( menuOpts ) );
            }
          } else {
            if ( cel.height() <= tHeight )
              break;
          }

          var found = false;

          for ( var li=0; li<rules.length; li++ ) {
            var l      = rules[ li ];

            if ( !l )
              continue;

            var a      = p.find( result( l, 'a' ) ),
                tlevel = result( l, 'level' ) || 0;

            if ( l.when !== undefined && !result( l, 'when' ) )
              continue;

            if ( tlevel === r.level ) {
              var cand;

              var fn = result( l, 'fn' );
              if ( fn )
                fn();

              if ( result( l, 'hide' ) )
                a.hide();

              var inner = result( l, 'inner' );
              if ( inner !== undefined )
                a.html( inner ? inner : '' );

              var outer = result( l, 'outer' );
              if ( outer !== undefined ) {
                if ( outer )
                  a.replaceWith( outer );
                else
                  a.remove();
              }

              var css = result( l, 'css' );
              if ( css )
                a.css( css );

              var addClass = result( l, 'addClass' );
              if ( addClass )
                a.addClass( addClass );

              var removeClass = result( l, 'removeClass' );
              if ( removeClass )
                a.removeClass( removeClass );

              var menuLimit = result( l, 'menuLimit' );
              var menuIcons = result( l, 'menuIcons' );
              if ( menuLimit !== undefined || menuIcons !== undefined ) {
                if ( menuIcons !== undefined )
                  r.menuIcons = menuIcons;

                if ( menuLimit !== undefined )
                  r.menuLimit = menuLimit;

                // TODO:  rerender menu item until it fits ... THEN render overflow at the end ...
                $( menuAnchor ).html( r.menu( menuOpts ) );
              }

              found = true;
            }
          }

          r.level++;

          if ( !found && tlevel )
            break;

          //console.log( 'processed ' + r.level + '; cel.height:' + cel.height() + ' target height:' + tHeight + ' found:' + found );
        }

        cel.css( 'visibility', 'visible' );
      },

      menu: function( menuOpts ) {
        var items = menuOpts.items;

        var overflowOpts = null;

        if ( !menuOpts.submenu && menuOverflow ) {

          var l1 = [];
          var l2 = [];

          var more = r.menuLimit;

          for ( var i=0, ilen=items.length; i<ilen; i++ ) {
            var item = items[ i ];
            if ( item ) {
              if ( item === '|' ) {
                more = 0;
              } else {
                if ( !result( item, 'hide' ) ) {
                  if ( more ) {
                    l1.push( item );
                    more--;
                  } else {
                    l2.push( item );
                  }
                }
              }
            }
          }

          items = l1;
          if ( l2.length )
            overflowOpts = {
              items:   l2,
              submenu: true
            };
        }

        var opts = {};
        opts.icons = !menuOpts.submenu && r.menuIcons;

        var html = menuRenderer( items, opts );

        if ( overflowOpts )
          html += '<li class="dropdown">' + linkRenderer( menuOverflow, { icons: r.menuIcons, submenu: true } ) + r.submenu( overflowOpts ) + '</li>';

        return html;
      },

      submenu: function( menuOpts ) {
        return '<ul class="dropdown-menu">' + menuRenderer( menuOpts.items, {} ) + '</ul>';
      }
    };

    return r;
  };

  if ( typeof define == 'function' && typeof define.amd == 'object' && define.amd ) {
    define(function() {
      return responsively;
    });
  } else {
    window.responsively = responsively;
  }
}(this));

