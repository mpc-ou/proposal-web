function renderPage(projectA, projectB) {
    return `
        <div class="page exhibitions-page">
        <div class="exhibitions__side" data-animate="fadeInLeft">
            <div class="exhibitions__team-img-a">
                <div class="exhibitions__window-box">
                    <div class="exhibitions__dot"></div>
                    <div class="exhibitions__dot"></div>
                    <div class="exhibitions__dot"></div>
                    <img src="${projectA.imgs[0]}" alt="" srcset="">
                </div>
            </div>
            <div class="exhibitions__team-info-a">
                <div class="exhibitions__team-name-a">${projectB.teamName}</div>
                <div class="exhibitions__project-name-a">${projectB.projectName}</div>
            </div>

        </div>
        <div class="exhibitions__side" data-animate="fadeInRight">
            <div class="exhibitions__team-info-b">
                <div class="exhibitions__team-name-a">${projectA.teamName}</div>
                <div class="exhibitions__project-name-a">${projectA.projectName}</div>
            </div>
            <div class="exhibitions__team-img-b">

                <div class="exhibitions__window-box">
                    <div class="exhibitions__dot"></div>
                    <div class="exhibitions__dot"></div>
                    <div class="exhibitions__dot"></div>
                    <img src="${projectB.imgs[0]}" alt="" srcset="">
                </div>
            </div>
        </div>
    </div>
    `
}



export default function initTrienLam(root, data) {
    const exhibitionsZone = document.querySelector("#exhibitions")

    fetch("./sections/exhibitions/exhibitions.json")
        .then(response => response.json())
        .then(data => {
            const teams = data[0].teams
            for (let i = 0; i < teams.length; i += 2) {
                const projectA = teams[i];
                const projectB = teams[i + 1];
                const pageHTML = renderPage(projectA, projectB);
                exhibitionsZone.innerHTML += pageHTML;
            }
        });
}
