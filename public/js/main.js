var navBurger = document.getElementById('navBurger');

navBurger.addEventListener('click', function () {
    var targetId = navBurger.dataset.target;
    var target = document.getElementById(targetId);

    target.classList.toggle('is-active');
    navBurger.classList.toggle('is-active');
});
