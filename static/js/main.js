/**
 * MegaBuy.sk - Main JavaScript
 * Based on MegaPrice WordPress Theme
 */

(function() {
    'use strict';

    // === BADGE INITIALIZATION ===
    function initBadges() {
        var wishlist = [];
        var compare = [];
        try {
            wishlist = JSON.parse(localStorage.getItem('mp_wishlist') || '[]');
            compare = JSON.parse(localStorage.getItem('mp_compare') || '[]');
        } catch(e) {}
        
        document.querySelectorAll('[data-badge="wishlist"]').forEach(function(badge) {
            var count = wishlist.length;
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        });
        
        document.querySelectorAll('[data-badge="compare"]').forEach(function(badge) {
            var count = compare.length;
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        });
    }
    
    // Init badges on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBadges);
    } else {
        initBadges();
    }
    
    // Sync across tabs
    window.addEventListener('storage', function(e) {
        if (e.key === 'mp_compare' || e.key === 'mp_wishlist') {
            initBadges();
        }
    });

    // === SCROLL HANDLING - Header collapse ===
    (function() {
        var catnav = document.getElementById('mp-catnav');
        if (!catnav) return;
        
        var scrollThreshold = 200;
        var hysteresis = 50;
        var isCollapsed = false;
        var ticking = false;
        
        function updateHeader() {
            var currentScroll = window.pageYOffset || document.documentElement.scrollTop;
            
            if (currentScroll > scrollThreshold && !isCollapsed) {
                catnav.classList.add('is-collapsed');
                isCollapsed = true;
            } else if (currentScroll < (scrollThreshold - hysteresis) && isCollapsed) {
                catnav.classList.remove('is-collapsed');
                isCollapsed = false;
            }
            
            ticking = false;
        }
        
        window.addEventListener('scroll', function() {
            if (!ticking) {
                requestAnimationFrame(updateHeader);
                ticking = true;
            }
        }, { passive: true });
    })();

    // === MOBILE CATEGORY SCROLL ===
    (function() {
        var list = document.getElementById('catnav-list');
        var leftBtn = document.getElementById('catnav-left');
        var rightBtn = document.getElementById('catnav-right');
        
        if (!list || !leftBtn || !rightBtn) return;
        
        var scrollAmount = 150;
        
        leftBtn.addEventListener('click', function() {
            list.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
        
        rightBtn.addEventListener('click', function() {
            list.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
        
        function updateArrows() {
            var maxScroll = list.scrollWidth - list.clientWidth;
            leftBtn.style.opacity = list.scrollLeft > 10 ? '1' : '0.3';
            rightBtn.style.opacity = list.scrollLeft < maxScroll - 10 ? '1' : '0.3';
        }
        
        list.addEventListener('scroll', updateArrows, { passive: true });
        window.addEventListener('resize', updateArrows);
        setTimeout(updateArrows, 100);
    })();

    // === MEGA MENU ===
    (function() {
        var isMobile = function() { return window.innerWidth <= 768; };
        var mega = document.getElementById('mp-mega');
        var megaContent = document.getElementById('mp-mega-content');
        var megaTitle = document.getElementById('mp-mega-title');
        var megaClose = document.getElementById('mp-mega-close');
        var megaInner = document.getElementById('mp-mega-inner');
        var megaFooterBtn = document.getElementById('mp-mega-footer-btn');
        var catItems = document.querySelectorAll('.mp-catnav__item');
        var catnav = document.querySelector('.mp-catnav');
        var megaData = window.mpMegaData || {};
        var activeCatId = null;
        var hideTimer = null;
        
        function updateMegaPosition() {
            if (!mega || !catnav || !isMobile()) return;
            var rect = catnav.getBoundingClientRect();
            mega.style.setProperty('--mega-top', rect.bottom + 'px');
        }
        
        function closeMega() {
            if (!mega) return;
            mega.classList.remove('is-open');
            activeCatId = null;
            catItems.forEach(function(item) {
                item.classList.remove('is-active');
            });
        }
        
        function renderMegaContent(data) {
            var html = '';
            data.children.forEach(function(child) {
                html += '<div class="mp-mega__col">';
                html += '<a href="' + child.url + '" class="mp-mega__main">';
                if (child.image) {
                    html += '<img src="' + child.image + '" alt="" class="mp-mega__img">';
                } else {
                    html += '<div class="mp-mega__img-placeholder">' + child.name.charAt(0).toUpperCase() + '</div>';
                }
                html += '<span class="mp-mega__title">' + child.name + '</span>';
                html += '</a>';
                if (child.grandchildren && child.grandchildren.length > 0) {
                    html += '<ul class="mp-mega__links">';
                    child.grandchildren.forEach(function(g) {
                        html += '<li><a href="' + g.url + '">' + g.name + '</a></li>';
                    });
                    html += '</ul>';
                }
                html += '</div>';
            });
            return html;
        }
        
        function openMega(catId, catItem) {
            var data = megaData[catId];
            if (!data || !data.children || data.children.length === 0) {
                if (catItem) window.location.href = catItem.href;
                return;
            }
            
            if (activeCatId === catId && mega.classList.contains('is-open')) {
                closeMega();
                return;
            }
            
            activeCatId = catId;
            updateMegaPosition();
            
            if (megaTitle) megaTitle.textContent = data.name;
            
            catItems.forEach(function(item) {
                item.classList.remove('is-active');
            });
            if (catItem) catItem.classList.add('is-active');
            
            megaContent.innerHTML = renderMegaContent(data);
            mega.classList.add('is-open');
            
            if (isMobile() && megaInner) {
                megaInner.scrollTop = 0;
            }
        }
        
        // Desktop hover
        catItems.forEach(function(item) {
            item.addEventListener('mouseenter', function() {
                if (isMobile()) return;
                clearTimeout(hideTimer);
                var catId = this.getAttribute('data-cat-id');
                if (catId && catId !== activeCatId) {
                    openMega(catId, this);
                }
            });
            
            item.addEventListener('mouseleave', function() {
                if (isMobile()) return;
                hideTimer = setTimeout(closeMega, 150);
            });
            
            // Mobile click
            item.addEventListener('click', function(e) {
                if (isMobile()) {
                    e.preventDefault();
                    var catId = this.getAttribute('data-cat-id');
                    openMega(catId, this);
                }
            });
        });
        
        if (mega) {
            mega.addEventListener('mouseenter', function() {
                if (!isMobile()) clearTimeout(hideTimer);
            });
            mega.addEventListener('mouseleave', function() {
                if (!isMobile()) hideTimer = setTimeout(closeMega, 150);
            });
            
            // Click on overlay closes
            mega.addEventListener('click', function(e) {
                if (e.target === mega) closeMega();
            });
        }
        
        // Hamburger menu
        var hamburger = document.getElementById('mp-hamburger');
        if (hamburger) {
            hamburger.addEventListener('click', function(e) {
                e.stopPropagation();
                
                var html = '';
                for (var catId in megaData) {
                    var data = megaData[catId];
                    html += '<div class="mp-mega__col">';
                    html += '<a href="' + data.url + '" class="mp-mega__main">';
                    html += '<div class="mp-mega__img-placeholder">' + data.name.charAt(0).toUpperCase() + '</div>';
                    html += '<span class="mp-mega__title">' + data.name + '</span>';
                    html += '</a>';
                    if (data.children && data.children.length > 0) {
                        html += '<ul class="mp-mega__links">';
                        data.children.slice(0, 6).forEach(function(child) {
                            html += '<li><a href="' + child.url + '">' + child.name + '</a></li>';
                        });
                        if (data.children.length > 6) {
                            html += '<li><a href="' + data.url + '">Zobraziť všetky →</a></li>';
                        }
                        html += '</ul>';
                    }
                    html += '</div>';
                }
                
                if (megaTitle) megaTitle.textContent = 'Všetky kategórie';
                megaContent.innerHTML = html;
                
                if (mega.classList.contains('is-open')) {
                    closeMega();
                } else {
                    updateMegaPosition();
                    mega.classList.add('is-open');
                    if (isMobile() && megaInner) megaInner.scrollTop = 0;
                }
            });
        }
        
        // Close buttons
        if (megaClose) megaClose.addEventListener('click', closeMega);
        if (megaFooterBtn) megaFooterBtn.addEventListener('click', closeMega);
        
        // Click outside closes
        document.addEventListener('click', function(e) {
            if (!isMobile() && mega && mega.classList.contains('is-open')) {
                if (!e.target.closest('.mp-mega__panel') && 
                    !e.target.closest('.mp-catnav__item') && 
                    !e.target.closest('.mp-catnav__hamburger')) {
                    closeMega();
                }
            }
        });
        
        // Escape closes
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mega && mega.classList.contains('is-open')) {
                closeMega();
            }
        });
        
        // Update position on scroll/resize
        window.addEventListener('scroll', function() {
            if (mega && mega.classList.contains('is-open') && isMobile()) {
                updateMegaPosition();
            }
        }, { passive: true });
        
        window.addEventListener('resize', function() {
            if (mega && mega.classList.contains('is-open')) {
                updateMegaPosition();
            }
        });
        
        updateMegaPosition();
    })();

    // === WISHLIST FUNCTIONS ===
    window.mpWishlist = {
        get: function() {
            try {
                return JSON.parse(localStorage.getItem('mp_wishlist') || '[]');
            } catch(e) { return []; }
        },
        add: function(productId) {
            var list = this.get();
            if (list.indexOf(productId) === -1) {
                list.push(productId);
                localStorage.setItem('mp_wishlist', JSON.stringify(list));
                initBadges();
                return true;
            }
            return false;
        },
        remove: function(productId) {
            var list = this.get();
            var idx = list.indexOf(productId);
            if (idx > -1) {
                list.splice(idx, 1);
                localStorage.setItem('mp_wishlist', JSON.stringify(list));
                initBadges();
                return true;
            }
            return false;
        },
        toggle: function(productId) {
            if (this.has(productId)) {
                this.remove(productId);
                return false;
            } else {
                this.add(productId);
                return true;
            }
        },
        has: function(productId) {
            return this.get().indexOf(productId) > -1;
        },
        clear: function() {
            localStorage.setItem('mp_wishlist', '[]');
            initBadges();
        }
    };

    // === COMPARE FUNCTIONS ===
    window.mpCompare = {
        maxItems: 4,
        get: function() {
            try {
                return JSON.parse(localStorage.getItem('mp_compare') || '[]');
            } catch(e) { return []; }
        },
        add: function(productId) {
            var list = this.get();
            if (list.length >= this.maxItems) {
                alert('Môžete porovnať maximálne ' + this.maxItems + ' produkty.');
                return false;
            }
            if (list.indexOf(productId) === -1) {
                list.push(productId);
                localStorage.setItem('mp_compare', JSON.stringify(list));
                initBadges();
                return true;
            }
            return false;
        },
        remove: function(productId) {
            var list = this.get();
            var idx = list.indexOf(productId);
            if (idx > -1) {
                list.splice(idx, 1);
                localStorage.setItem('mp_compare', JSON.stringify(list));
                initBadges();
                return true;
            }
            return false;
        },
        toggle: function(productId) {
            if (this.has(productId)) {
                this.remove(productId);
                return false;
            } else {
                this.add(productId);
                return true;
            }
        },
        has: function(productId) {
            return this.get().indexOf(productId) > -1;
        },
        clear: function() {
            localStorage.setItem('mp_compare', '[]');
            initBadges();
        }
    };

    // === CLICK TRACKING ===
    document.addEventListener('click', function(e) {
        var link = e.target.closest('[data-offer-id]');
        if (link) {
            var offerId = link.getAttribute('data-offer-id');
            // Track click via /go/:offerId endpoint
            // The redirect happens server-side
        }
    });

    // === GALLERY ===
    document.addEventListener('click', function(e) {
        var thumb = e.target.closest('.mp-gallery__thumb');
        if (thumb) {
            var gallery = thumb.closest('.mp-gallery');
            var mainImg = gallery.querySelector('.mp-gallery__main img');
            var thumbImg = thumb.querySelector('img');
            
            if (mainImg && thumbImg) {
                mainImg.src = thumbImg.src.replace('-150x150', '').replace('-thumbnail', '');
                
                gallery.querySelectorAll('.mp-gallery__thumb').forEach(function(t) {
                    t.classList.remove('is-active');
                });
                thumb.classList.add('is-active');
            }
        }
    });

    // === TABS ===
    document.addEventListener('click', function(e) {
        var tab = e.target.closest('.mp-tabs__tab');
        if (tab) {
            var tabs = tab.closest('.mp-tabs');
            var target = tab.getAttribute('data-tab');
            
            tabs.querySelectorAll('.mp-tabs__tab').forEach(function(t) {
                t.classList.remove('is-active');
            });
            tabs.querySelectorAll('.mp-tabs__panel').forEach(function(p) {
                p.classList.remove('is-active');
            });
            
            tab.classList.add('is-active');
            var panel = tabs.querySelector('.mp-tabs__panel[data-panel="' + target + '"]');
            if (panel) panel.classList.add('is-active');
        }
    });

})();
