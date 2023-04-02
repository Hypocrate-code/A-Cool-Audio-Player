const vinyle = document.querySelector('.vinyle'),
vinyleImg = vinyle.children[0],
diamant = document.querySelector('.diamant'),
pointe = diamant.children[1],
songName = document.getElementById('name'),
launchMenu = document.querySelector('.finalisation'),

audioPlayer = document.querySelector('.audio-player'),
cover = audioPlayer.children[0].children[0],
optionsBtn = document.getElementById('options'),
optionMenu = document.querySelector('.options-menu'),
audioTrack = document.getElementById('timestamps'),
timing = document.getElementById('timing'),
ejectBtn = document.getElementById('eject'),
pauseBtn = document.getElementById('play_pause'),
skipBtn = document.getElementById('skip'),
previousBtn = document.getElementById('previous'),
restartBtn = document.getElementById('restart'),
volumeSlider = document.querySelector('.options-menu input'),

menu = document.querySelector('.menu'),
temporaryBtn = Array.from(document.querySelectorAll('.menu #redirect')),

vinyleScratch = new Audio('audio/bruit de vinyle.wav');
vinyleScratch.volume = 0.25
let actualAudio = new Audio();

let volume = localStorage.getItem('volume') === null ? 1 : parseFloat(localStorage.getItem('volume')),

duration = 650,
isUpdating,
userPlaylist=[],
logSound=false;

const songs = Array.from(document.querySelectorAll('.songs')),
vinylBox = document.querySelector('.vinyl-box'),
coverChangeOnHover = launchMenu.children[1],
titleChangeOnHover = launchMenu.children[2];
let actualIndexOfSong = 0;

const volumeSpan = document.getElementById('volume-value');

function actualizeVolume(isLogged) {
    isLogged ? volume = volumeSlider.value : volumeSlider.value = volume;
    localStorage.setItem('volume', volume);
    actualAudio.volume = volume;
    volumeSpan.textContent = Math.floor(volumeSlider.value*100);
}

volumeSlider.addEventListener('input',actualizeVolume, logSound)

function checkViewport() {
    // console.log(actualIndexOfSong);
    if(window.innerHeight>=window.innerWidth/100*90 && window.innerWidth<940) {
        if(!launchMenu.classList.contains('visible')) {
            launchMenu.classList.add('visible');
            coverChangeOnHover.style.opacity = 1;
        }
        const data = getTheRightData(songs[actualIndexOfSong]);
        setMusicInfos(data);
        checkOtherSong(0,songs[actualIndexOfSong]);
        songs[actualIndexOfSong].classList.add('out');
        launchMenu.children[3].addEventListener('click',()=>initiateASong(data[0], data[1], data[2], data[3]))
        launchMenu.children[4].addEventListener('click',()=>{
            actualIndexOfSong==songs.length-1 ? actualIndexOfSong=0 : actualIndexOfSong+=1;
            checkViewport()
        }, {once: true})

    }
}
checkViewport();
window.addEventListener('resize',checkViewport)

function initiateASong(imgLink, audioSource, Author, nameOfSong, song) {
    if(!(window.innerHeight>=window.innerWidth/100*90 && window.innerWidth<940))  {
        launchMenu.classList.remove('visible');
        coverChangeOnHover.style.opacity=0;
        song.classList.remove('out');
    }
    menu.classList.add('hidden');
    songName.textContent = `${nameOfSong} - ${Author}`
    actualAudio.ended = false;
    actualizeVolume(logSound);
    audioTrack.value = 0;
    logSound = true;
    isUpdating=true;
    audioTrack.style.setProperty('pointer-events', 'auto');
    pauseBtn.classList.remove('paused');
    vinyleImg.src = imgLink;
    vinyle.classList.add('active');
    cover.src = imgLink;
    vinyle.addEventListener('animationend',()=> {
        actualAudio.src = audioSource;
        vinyle.classList.add('ended');
        setTimeout(()=>vinyle.style.animationTimingFunction='linear',1490);
        diamant.classList.contains('active') ? duration = 10 : diamant.style.transform = 'translateZ(-24em) rotate(180deg)';
        setTimeout(() => {
            pointe.style.transform = 'rotateX(90deg) rotateZ(-50deg)';
            pointe.addEventListener('transitionend', ()=> {
                vinyleScratch.play();
                setTimeout(()=> {
                    actualAudio.play();
                    vinyle.style.setProperty('transform', 'rotateX(70deg) translateY(1.5em) translateX(2em)');
                    pointe.style.transition = 'transform .3s';
                    audioPlayer.classList.remove('hidden');
                }, 1000)
            }, {once:true})
        }, duration);
    },{once: true})
}

let seconds,
minutes;

actualAudio.addEventListener('timeupdate', function() {
    isUpdating ? pointe.style.transform = `rotateX(90deg) rotateZ(${audioTrack.value/2-50}deg)` : false;
    audioTrack.value = (actualAudio.currentTime / actualAudio.duration) * 100;
    minutes = `${parseInt(actualAudio.currentTime/60)}`
    seconds = `${parseInt(actualAudio.currentTime - minutes*60)}`.padStart(2,'0')
    timing.textContent = `${minutes}:${seconds}`;
});
actualAudio.addEventListener('play', createBodyShadeVisualisation)

audioTrack.addEventListener('input', function() {
    actualAudio.ended ? audioTrack.value=100 : actualAudio.currentTime = (audioTrack.value / 100) * actualAudio.duration;
});
audioTrack.addEventListener('mousedown',()=>{
    actualAudio.volume = 0
    vinyle.style.animationPlayState = 'paused'
})
audioTrack.addEventListener('mouseup',()=> {
    actualAudio.volume = volume
    actualAudio.paused ? true : vinyle.style.animationPlayState = 'running';
})

restartBtn.addEventListener('click',()=> {
    actualAudio.pause()
    isUpdating = false;
    actualRotationOfVinyl = window.getComputedStyle(vinyle).transform;
    vinyle.style.transform = actualRotationOfVinyl;
    audioTrack.value = 0;
    actualAudio.currentTime = 0;
    vinyle.style.animationPlayState='paused';
    vinyle.style.animation='none';
    pointe.style.transform = 'rotateX(70deg) rotateZ(-35deg)';
    pointe.addEventListener('transitionend', ()=> {
        vinyle.style.transform = 'rotateX(70deg) translateY(1.5em) translateX(2em) rotate(0deg)'
        vinyle.addEventListener('transitionend', ()=> {
            vinyle.style.animation='spinning-disc 1.5s linear .5s infinite';
            vinyle.style.animationPlayState='playing';
            actualAudio.play();
            isUpdating = true;
        })
    }, {once: true})
    
})


actualAudio.addEventListener('ended', ()=>{
    audioTrack.value = 100;
    document.body.style.background = 'radial-gradient(circle, #a34937 0%, #7a2b20 85%, #48150e 100%)'
    audioTrack.style.setProperty('pointer-events', 'none');
    pauseBtn.classList.add('paused');
    actualAudio.pause();
    endCurrentActionAndWhatWeDoNext('')
})

pauseBtn.addEventListener('click',Pause)
function Pause() {
    pauseBtn.classList.toggle('paused');
    if(actualAudio.paused) {
        actualAudio.play();
        vinyle.style.animationPlayState = 'running';
    } 
    else {
        actualAudio.pause();
        vinyle.style.animationPlayState = 'paused';
    }
}

previousBtn.addEventListener('click',()=>{
    endCurrentActionAndWhatWeDoNext('previous')
    // userPlaylist.forEach(title=>{
    //     if (title[1]==actualAudio.src && userPlaylist.indexOf(title)!=0) {
    //         initiateASong(title[0], title[1], title[2, title[3]])
    //     }
    // })
});

let nextSoundIndex;

function endCurrentActionAndWhatWeDoNext(action) {
    optionMenu.classList.remove('visible');
    isUpdating=false;
    actualAudio.pause();
    // if(window.getComputedStyle(vinyle).animationPlayState == 'paused') {
        // pointe.style.transitionDuration = '.5s'
        pointe.style.transform = 'none'
            pointe.addEventListener('transitionend', ()=> {
                if(action === 'previous'){
                    let maybeIndex = 0;
                    songs.forEach(song=>{
                        const data = getTheRightData(song);
                        if(data[3]===songName.textContent.split(' - ')[0] && maybeIndex>0){
                            actualSoundIndex = maybeIndex;
                        }
                        maybeIndex+=1;
                    })       
                }
                else if(action === 'skip') {

                }
                // else if(action === 'eject') {

                // }
                // else if(action === 'previous')
                else {
                    audioPlayer.classList.add('hidden');
                    setTimeout(()=> {
                        menu.classList.remove('hidden');
                    }, 1250)
                }
                vinyle.style.animation = 'vinyl-outgoing 2s ease-out forwards';
                    vinyle.addEventListener('animationend', ()=>{
                        
                        vinyle.classList.remove('active');
                        vinyle.classList.remove('ended');
                        vinyle.style.transform = 'translateZ(30em) translateY(-40%) translateX(-50vw) scale(1.35)';
                        vinyle.style.animation = '';
                        audioTrack.value=0;

                        document.body.style.background='radial-gradient(circle, #a34937 0%, #7a2b20 85%, #48150e 100%)';
                        actualAudio.currentTime=0;
                        if(actualSoundIndex!=undefined) {
                            const data = getTheRightData(songs[actualSoundIndex-1])
                            isUpdating = false;
                            initiateASong(data[0], data[1],data[2],data[3], songs[0])

                        }
                        else if(action==='skip') {

                        }
                        else {

                        }
                    }, {once: true})
                
            }, {once: true});
}
function createBodyShadeVisualisation() {
    let audioCtx = new AudioContext();
    let nodeAudio = audioCtx.createMediaElementSource(actualAudio);
    let analyser = audioCtx.createAnalyser();
    nodeAudio.connect(analyser);
    analyser.connect(audioCtx.destination);
    analyser.fftSize = 32;
    let bufferLenght = analyser.frequencyBinCount;
    let particularlyFormatedArray = new Uint8Array(bufferLenght)
    function boxShadowMoving() {
        if(actualAudio.paused) {cancelAnimationFrame(boxShadowMoving)}
        else {
            analyser.getByteFrequencyData(particularlyFormatedArray);
            let percentage = (1-particularlyFormatedArray[4]/250)*100;
            if(percentage<80) {
                document.body.style.background = `radial-gradient(circle, #a34937 0%, #7a2b20 ${percentage + 10}%, #48150e 100%)`;
            } 
            requestAnimationFrame(boxShadowMoving);
        }
    }
    boxShadowMoving();
}
optionsBtn.addEventListener('click', ()=>optionMenu.classList.toggle('visible'))
ejectBtn.addEventListener('click', endCurrentActionAndWhatWeDoNext)

function getTheRightData(song) {
    const redirectParams = song.getAttribute('data-redirect-params').split('|');
    [coverImg, songLink, author, title] = redirectParams;
    return [coverImg, songLink, author, title];
}

function setMusicInfos(data) {
    coverChangeOnHover.src = data[0];
    titleChangeOnHover.innerHTML = `${data[3]} by <span>${data[2]}</span>`
}

songs.forEach(song => {
    const data = getTheRightData(song);
    userPlaylist.push(data);
    song.style.setProperty('--cover', `url(${coverImg}`);
    song.style.setProperty('--index',songs.indexOf(song)+1);
    song.addEventListener('mouseover',() => {
        if(launchMenu.classList.contains('visible') || (window.innerHeight>=window.innerWidth/100*90 && window.innerWidth<940)){return;}
        getTheRightData(song);
        coverChangeOnHover.style.opacity = 1;
        coverChangeOnHover.src = coverImg;
        song.addEventListener('mouseleave',()=>{
            launchMenu.classList.contains('visible') || (window.innerHeight>=window.innerWidth/100*90 && window.innerWidth<940) ? true : coverChangeOnHover.style.opacity = 0;
        })
    })
    song.addEventListener('click', ()=>{
        if(window.innerHeight>=window.innerWidth/100*90 && window.innerWidth<940 && song.classList.contains('out')){return}
        setMusicInfos(data);
        checkOtherSong(0, song) === 0 && !(window.innerHeight>=window.innerWidth/100*90 && window.innerWidth<940) ? launchMenu.classList.toggle('visible') : false;
        song.classList.toggle('out');
        waitForValid(data, song);
    })
})

function checkOtherSong(iter, actualOut) {
    songs.forEach(instance=>{
        if(instance.classList.contains('out') && instance!=actualOut) {
            instance.classList.remove('out');
            iter +=1;
        }
    })
    return iter;
}

function waitForValid(data, song) {
    launchMenu.children[3].addEventListener('click',()=>initiateASong(data[0], data[1], data[2], data[3], song))
    launchMenu.children[4].addEventListener('click',()=>{
        launchMenu.classList.remove('visible');
        song.classList.remove('out');
    })
}

vinylBox.style.setProperty('--magic-skew', `${window.getComputedStyle(vinylBox).getPropertyValue('--box-depth').split('em')[0]/1.5}deg`);
