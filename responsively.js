/**
 * @license
 * responsively.js
 * Copyright 2014 Mark Bradley, Ted Halmrast
 * Available under MIT license <http://responsivelyjs.com/license>
 */
;(function(window) {

  function result(object, property) {
    if (object == null)
      return void 0;

    var value = object[property];
    return typeof value === 'function' ? value.call( object ) : value;
  };

  function responsively( opts ) {

    var p         = $( result( opts, 'parent' ) ),
        levels    = result( opts, 'levels' ),
        constrain = result( opts, 'constrain' ),
        cel, // cel = Constrained ELement
        tHeight   = result( opts, 'height' );

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

        cel = constrain ? p.find( constrain ) : p;
        var width = cel.width();

        if ( !tHeight )
          tHeight = cel.height();

        console.log( 'est width:' + width + ' target height:' + tHeight );

        this.update();
      },

      update: function() {
        cel.css( 'visibility', 'hidden' );

        for (;;) {

          T.spam( 'processing level ' + r.level + " cel.height:" + cel.height() + " tHeight:" + tHeight );

          if ( r.level && // always process level 0
               cel.height() <= tHeight )
            break;

          var found = false;

          for ( var li=0; li<levels.length; li++ ) {
            var l      = levels[ li ],
                a      = p.find( result( l, 'a' ) ),
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

              found = true;
            }
          }

          r.level++;

          if ( !found && tlevel )
            break;

          T.spam( 'cel.height:' + cel.height() + ' target height:' + tHeight + ' found:' + found );
        }

        cel.css( 'visibility', 'visible' );
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

