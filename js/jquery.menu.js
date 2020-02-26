let MainMenu = function () {

    let activated = false;

    let settings = {
        disabledClass: 'disabled',
        submenuClass: 'submenu'
    }

    let mask = '<div id="menu-top-mask" style="height: 2px; background-color: transparent; z-index:1001;"/>';
    let timeOut;
    this.init = function (p) {

        $.extend(settings, p);

        $mask = $('#menu-top-mask');

        $('ul.main-menu > li').click(function (event) {
            let target = $(event.target);
            if (target.hasClass(settings.disabledClass) || target.parents().hasClass(settings.disabledClass) || target.hasClass(settings.submenuClass)) {
                return;
            }

            toggleMenuItem($(this));
        });

        $('ul.main-menu > li > ul li').click(function (event) {
			
			// Prevent click event to propagate to parent elements
			event.stopPropagation();

			// Prevent any operations if item is disabled
			if ($(this).hasClass(settings.disabledClass)) {
                return;
            }

            // If item is active, check if there are submenus (ul elements inside current li)
            if ($(this).has( "ul" ).length > 0) {
            	// Automatically toggle submenu, if any
                toggleSubMenu($(this));
            }
            else{
            	// If there are no submenus, close main menu.
            	closeMainMenu();
            }
        });

        $('ul.main-menu > li').mouseenter(function () {
            if (activated && $(this).hasClass('active-menu') == false) {
                toggleMenuItem($(this));
            }
        });

        $('ul.main-menu > li > ul li').mouseenter(function (e) {
            // Hide all other opened submenus in same level of this item
            $el = $(e.target);
            if ($el.hasClass('separator')) return;
            clearTimeout(timeOut);
            let parent = $el.closest('ul');
            parent.find('ul.active-sub-menu').each(function () {
                if ($(this) != $el)
                    $(this).removeClass('active-sub-menu').hide();
            });

            // Show submenu of selected item
            if ($el.children().size() > 0) {
                timeOut = setTimeout(function () { toggleSubMenu($el) }, 500);
            }
        });

        $('ul.main-menu > li > ul li').each(function () {
            if ($(this).children('ul').size() > 0) {
                $(this).addClass(settings.submenuClass);
            }
        });

        $('ul.main-menu li.' + settings.disabledClass).bind('click', function (e) {
            e.preventDefault();
        });

        //#region - Toggle Main Menu Item -

        toggleMenuItem = function (el) {

            // Hide all open submenus
            $('.active-sub-menu').removeClass('active-sub-menu').hide();

            $('#menu-top-mask').remove();

            let submenu = el.find("ul:first");
            let top = parseInt(el.css('padding-bottom').replace("px", ""), 10) + parseInt(el.css('padding-top').replace("px", ""), 10) +
                        el.position().top +
                        el.height();

            submenu.prepend($(mask));
            let $mask = $('#menu-top-mask');
            let maskWidth = el.width() +
                            parseInt(el.css('padding-left').replace("px", ""), 10) +
                            parseInt(el.css('padding-right').replace("px", ""), 10);

            $mask.css({ position: 'absolute',
                top: '-1px',
                width: (maskWidth) + 'px'
            });

            submenu.css({
                position: 'absolute',
                top: top + 'px',
                left: el.offset().left + 'px',
                zIndex: 100
            });

            submenu.stop().toggle();
            activated = submenu.is(":hidden") == false;

            !activated ? el.removeClass('active-menu') : el.addClass('active-menu');

            if (activated) {
                $('.active-menu').each(function () {
                    if ($(this).offset().left != el.offset().left) {
                        $(this).removeClass('active-menu');
                        $(this).find("ul:first").hide();
                    }
                });
            }
        }

        //#endregion

        //#region - Toggle Sub Menu Item -

        toggleSubMenu = function (el) {

            if (el.hasClass(settings.disabledClass)) {
                return;
            }

            let submenu = el.find("ul:first");
            let paddingLeft = parseInt(el.css('padding-right').replace('px', ''), 10);
            let borderTop = parseInt(el.css('border-top-width').replace("px", ""), 10);
            borderTop = !isNaN(borderTop) ? borderTop : 1;
            let top = el.position().top - borderTop;

            submenu.css({
                position: 'absolute',
                top: top + 'px',
                left: el.width() + paddingLeft + 'px',
                zIndex: 1000
            });

            submenu.addClass('active-sub-menu');

            submenu.show();

            //el.mouseleave(function () {
            //	submenu.hide();
            //});
        }

        //#endregion

        closeMainMenu = function () {
            activated = false;
            $('.active-menu').find("ul:first").hide();
            $('.active-menu').removeClass('active-menu');
            $('.active-sub-menu').hide();
        };

        $(document).keyup(function (e) {
            if (e.keyCode == 27) {
                closeMainMenu();
            }
        });

        $(document).bind('click', function (event) {
            let target = $(event.target);
            if (!target.hasClass('active-menu') && !target.parents().hasClass('active-menu')) {
                closeMainMenu();
            }
        });
    }
}

$(document).ready(function () {
    new MainMenu().init();
});