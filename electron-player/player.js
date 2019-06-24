
var pp_list = ['play', 'pause'].reverse()
var videoplayer = $('#player')[0]
let list_of_files = []

$('#player, .video-controls').mouseenter(function () {
    $('.video-controls').fadeIn()
})
$('#player').mouseleave(function () {
    $('.video-controls').fadeOut()
})


$('.pp-button').click(function () {
    if (pp_list[0] === 'play') {
        $("#play-button").hide()
        $("#pause-button").show()
        videoplayer.play()
        pp_list.reverse()
    }
    else {
        $("#play-button").show()
        $("#pause-button").hide()
        videoplayer.pause()
        pp_list.reverse()
    }
})

$('.fullscrean').click(function () {
    if (videoplayer.requestFullscreen) {
        videoplayer.requestFullscreen();
    } else if (videoplayer.mozRequestFullScreen) { /* Firefox */
        videoplayer.mozRequestFullScreen();
    } else if (videoplayer.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        videoplayer.webkitRequestFullscreen();
    } else if (videoplayer.msRequestFullscreen) { /* IE/Edge */
        videoplayer.msRequestFullscreen();
    }
})

$('.step-previous').click(function () {
    videoplayer.currentTime = videoplayer.currentTime - 10
    $('.slider').val(100 * videoplayer.currentTime / videoplayer.duration)
})

$('.step-next').click(function () {
    videoplayer.currentTime = videoplayer.currentTime + 10
    $('.slider').val(100 * videoplayer.currentTime / videoplayer.duration)
})

$('.slider').click(function () {
    videoplayer.currentTime = videoplayer.duration * ($(this).val() / 100)
})


const VideoLib = require('node-video-lib');
const fs = require('fs');
const dragDrop = require('drag-drop')
let contador = 0
let video_types = ['.mp4', '.mkv', '.avi']
let skipList = []
let counterPinClick = 1
let skipContent;
let fases = { 'init_intro': 0, 'end_intro': 0, 'end_end': 0 }
let skipMode = "0"
let app
let init_intro = 0
let end_intro = 0
let end_end = 0
const ThumbnailGenerator = require('video-thumbnail-generator').default;
let playlist = []
app = new Vue({
    el: ' #side-menu-ul',
    data: {
        files: playlist
    },
    methods: {
        jump: (file) => {
            console.log(file.path)
            videoplayer.src = file.path
            videoplayer.play()
            notification = new Notification(file.title)
            setTimeout(notification.close.bind(notification), 1000);
            setInterval(incrementSeconds, 1000)
            contador = file.counter
            initalizeBySkip(contador)
        }
    }
})
let addZero = (element) => {
    if (element.length === 2) {
        return element
    }
    else {
        return "0" + element
    }
}

let skipSwitch = () => {

    switch (skipMode) {
        case "0":
            $('#pin-button').fadeIn()
            break;
        case "1":
            $('#pin-button').fadeOut()
            if ((videoplayer.currentTime >= init_intro && videoplayer.currentTime <= end_intro) || videoplayer.currentTime >= end_end) {
                $('.skip-button').fadeIn()
            }
            else {
                $('.skip-button').fadeOut()
            }
            break;
        case "2":
            $('#pin-button').fadeOut()
            if (videoplayer.currentTime >= init_intro && videoplayer.currentTime <= end_intro) {
                videoplayer.currentTime = end_intro
            }
            if (videoplayer.currentTime > end_intro && videoplayer.currentTime >= end_end) {
                $('.next').click()
            }
            break;
    }
}

let incrementSeconds = () => {
    skipSwitch()
    timerText = moment(videoplayer.currentTime * 1000).format('mm:ss')
    totalTimeText = moment(videoplayer.duration * 1000).format('mm:ss')
    $('.timer>span').text(timerText + ' / ' + totalTimeText)
    $('.slider').val(100 * videoplayer.currentTime / videoplayer.duration)



}

let initalizeBySkip = (contador) => {
    $('#side-menu-ul > li').removeClass('isActive')
    if (contador === 0) {
        setTimeout(() => {
            $('#side-menu-ul > li:nth-child(' + (contador + 1).toString() + ')').addClass('isActive')
        }, 7000)
    }
    else {
        $('#side-menu-ul > li:nth-child(' + (contador + 1).toString() + ')').addClass('isActive')
    }


    skipContent.filter((element, index) => {
        if (index === contador) {
            init_intro = element[index].init_intro
            end_intro = element[index].end_intro
            end_end = element[index].end_end
            // console.log(init_intro, end_intro, end_end)
            return element
        }
    })
}

let verifyVideoType = (file) => {
    prod = 0
    video_types.forEach((e, i) => {
        prod += file.fullPath.includes(e)
    })
    return prod
}

dragDrop('body', function (files) {
    playlist = []
    skipFile = files.find((element) => {
        if (element.fullPath.includes('.skip')) {
            return element
        }
    })
    console.log(skipFile)
    if (skipFile === undefined) {
        console.log('arquivo nao existe')
    }
    else {
        console.log('arquivo existe')
        skipContent = JSON.parse(fs.readFileSync(skipFile.path, 'utf8'))
        initalizeBySkip(contador)
        skipList = skipContent
    }
    files = files.filter((element) => {
        return verifyVideoType(element)
    })
    console.log(files)
    list_of_files = files.sort(function (a, b) {
        if (verifyVideoType(a) && verifyVideoType(b)) {
            if (a.fullPath < b.fullPath) {
                return -1
            }
            else {
                return 1
            }
        }

    })
    console.log(list_of_files)
    list_of_files.forEach((e, i) => {
        file = {}
        index = list_of_files[0].path.lastIndexOf('/')
        list_of_files[0].path.slice(0, index)
        const tg = new ThumbnailGenerator({
            sourcePath: e.path,
            thumbnailPath: list_of_files[0].path.slice(0, index) + '/.thumb',
            tmpDir: '/some/writeable/directory' //only required if you can't write to /tmp/ and you need to generate gifs
        });

        tg.generateOneByPercent(50)
            .then(console.log);

        fs.open(e.path, 'r', function (err, fd) {
            try {
                let movie = VideoLib.MovieParser.parse(fd);
                file.img = list_of_files[0].path.slice(0, index) + '/.thumb/' + e.name.replace(".mp4", "") + '-thumbnail-320x240-0001.png'
                file.title = e.name
                file.time = moment(movie.relativeDuration() * 1000).format('mm:ss')
                file.path = e.path
                file.counter = i
                playlist.push(JSON.parse(JSON.stringify(file)))
                // Work with movie
                // console.log('Duration:',
                //     moment(movie.relativeDuration() * 1000).format('mm:ss')
                // );
            } catch (ex) {
                console.error('Error:', ex);
            } finally {
                fs.closeSync(fd);
            }
        });


    })


    setTimeout(() => {
        app.files = playlist
        console.log(playlist)
    }, 5000)


    videoplayer.src = list_of_files[contador].path
    videoplayer.play()
    notification = new Notification(list_of_files[contador].fullPath)
    setTimeout(notification.close.bind(notification), 1000);
    setInterval(incrementSeconds, 1000)
})

videoplayer.onended = function () {
    contador++
    videoplayer.src = list_of_files[contador].path
    videoplayer.play()
    notification = new Notification(list_of_files[contador].fullPath)
    setTimeout(notification.close.bind(notification), 1000);
}

$('.next').click(function () {
    if (contador >= 0 && contador < list_of_files.length - 1) {
        contador++
    }
    videoplayer.src = list_of_files[contador].path
    videoplayer.play()
    initalizeBySkip(contador)
    notification = new Notification(list_of_files[contador].fullPath)
    setTimeout(notification.close.bind(notification), 1000);

})
$('.previous').click(function () {
    if (contador >= 1 && contador <= list_of_files.length) {
        contador--

    }
    videoplayer.src = list_of_files[contador].path
    videoplayer.play()
    initalizeBySkip(contador)
    notification = new Notification(list_of_files[contador].fullPath)
    setTimeout(notification.close.bind(notification), 1000);

})

$('#pin-button').click(function () {


    switch (counterPinClick) {
        case 1:
            fases.init_intro = videoplayer.currentTime
            break;
        case 2:
            fases.end_intro = videoplayer.currentTime
            break;
        case 3:
            fases.end_end = videoplayer.currentTime
            skipList[contador] = { [contador]: JSON.parse(JSON.stringify(fases)) }
            fases = { 'init_intro': 0, 'end_intro': 0, 'end_end': 0 }
            index = list_of_files[0].path.lastIndexOf('/')
            fs.writeFile(list_of_files[0].path.slice(0, index) + '/electron.skip', JSON.stringify(skipList), (err) => {
                console.log(err)
            })
            break;
    }

    counterPinClick++
    if (counterPinClick > 3) {
        counterPinClick = 1
    }
    $('#pin-button>span').text(counterPinClick)


})

$('.skip-button').click(() => {
    if (videoplayer.currentTime <= end_intro) {
        videoplayer.currentTime = end_intro
    }
    if (videoplayer.currentTime > end_intro && videoplayer.currentTime >= end_end) {
        $('.next').click()
    }

})

$('#skip-menu').click(() => {
    skipMode = $('#skip-menu').val()
})

$('.sound').click(() => {
    videoplayer.volume = $('.slider-sound').val() / 100
})

$('#play-list').click(() => {
    console.log('list')
    $('.side-menu').toggle()
})

