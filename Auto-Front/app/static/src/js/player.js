// $(document).ready(function () {
//     var pp_list = ['play', 'pause'].reverse()
//     var videoplayer = $('#player')[0]

//     setInterval(function () {
//         timerText = moment(videoplayer.currentTime * 1000).format('mm:ss')
//         totalTimeText = moment(videoplayer.duration * 1000).format('mm:ss')
//         $('.timer>span').text(timerText + ' / ' + totalTimeText)
//         $('.slider').val(100 * videoplayer.currentTime / videoplayer.duration)
//     }, 1000)

//     $('#player, .video-controls').mouseenter(function () {
//         $('.video-controls').fadeIn()
//     })
//     $('#player').mouseleave(function () {
//         $('.video-controls').fadeOut()
//     })


//     $('.pp-button').click(function () {
//         if (pp_list[0] === 'play') {
//             $("#play-button").hide()
//             $("#pause-button").show()
//             videoplayer.play()
//             pp_list.reverse()
//         }
//         else {
//             $("#play-button").show()
//             $("#pause-button").hide()
//             videoplayer.pause()
//             pp_list.reverse()
//         }
//     })

//     $('.fullscrean').click(function () {
//         if (videoplayer.requestFullscreen) {
//             videoplayer.requestFullscreen();
//         } else if (videoplayer.mozRequestFullScreen) { /* Firefox */
//             videoplayer.mozRequestFullScreen();
//         } else if (videoplayer.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
//             videoplayer.webkitRequestFullscreen();
//         } else if (videoplayer.msRequestFullscreen) { /* IE/Edge */
//             videoplayer.msRequestFullscreen();
//         }
//     })

//     $('.step-previous').click(function () {
//         videoplayer.currentTime = videoplayer.currentTime - 10
//         $('.slider').val(100 * videoplayer.currentTime / videoplayer.duration)
//     })

//     $('.step-next').click(function () {
//         videoplayer.currentTime = videoplayer.currentTime + 10
//         $('.slider').val(100 * videoplayer.currentTime / videoplayer.duration)
//     })

//     $('.slider').click(function () {
//         videoplayer.currentTime = videoplayer.duration * ($(this).val() / 100)
//     })

//     $('#pin-button').click(function () {
//         console.log(videoplayer.currentTime)
//     })
// });

