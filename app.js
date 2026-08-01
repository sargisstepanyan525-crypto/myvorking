// --- სოციალური აგენტის აპლიკაციის ლოგიკა ---

// 1. საწყისი მონაცემები (თუ LocalStorage ცარიელია)
const initialCases = [
    {
        id: "SSA-1001",
        fullname: "გიორგი მელაძე",
        address: "თბილისი, გლდანი 5 მ/რ",
        members: 4,
        income: 350,
        property: "basic",
        vulnerable: "disabled",
        score: 48500,
        status: "შეფასებული"
    },
    {
        id: "SSA-1002",
        fullname: "ნინო კაპანაძე",
        address: "ქუთაისი, რუსთაველის ქ. #12",
        members: 2,
        income: 600,
        property: "good",
        vulnerable: "none",
        score: 112000,
        status: "შეფასებული"
    }
];

// მონაცემების წამოღება LocalStorage-დან
let casesData = JSON.parse(localStorage.getItem('ssa_cases')) || initialCases;

// DOM ელემენტების წამოღება
const navButtons = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');
const pageTitle = document.getElementById('page-title');
const socialForm = document.getElementById('social-form');
const casesTableBody = document.getElementById('cases-table-body');
const recentList = document.getElementById('recent-list');

// 2. ტაბების გადართვის ლოგიკა
const titlesMap = {
    dashboard: "საინფორმაციო დაფა (Dashboard)",
    cases: "განაცხადების სია",
    declaration: "ახალი დეკლარაციის შევსება"
};

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');

        navButtons.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        document.getElementById(targetTab).classList.add('active');
        pageTitle.textContent = titlesMap[targetTab];
    });
});

// 3. სოციალური ქულის დათვლის ალგორითმი (სიმულაცია)
function calculateSocialScore(members, income, property, vulnerable) {
    let baseScore = 70000;

    // შემოსავლის გავლენა
    const incomePerCapita = income / members;
    baseScore += incomePerCapita * 80;

    // ქონების გავლენა
    if (property === 'none') baseScore -= 20000;
    if (property === 'good') baseScore += 35000;

    // სპეციალური სტატუსის გავლენა
    if (vulnerable === 'disabled') baseScore -= 15000;
    if (vulnerable === 'pensioner') baseScore -= 10000;
    if (vulnerable === 'single_parent') baseScore -= 12000;

    // წევრების რაოდენობის გავლენა
    if (members >= 4) baseScore -= 10000;

    return Math.max(10000, Math.round(baseScore));
}

// 4. მონაცემთა განახლება და ასახვა UI-ში
function updateUI() {
    // სტატისტიკის განახლება
    document.getElementById('stat-total').textContent = casesData.length;
    document.getElementById('stat-completed').textContent = casesData.length;
    document.getElementById('stat-pending').textContent = 0;

    // ცხრილის შევსება
    casesTableBody.innerHTML = '';
    casesData.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${item.id}</strong></td>
            <td>${item.fullname}</td>
            <td>${item.address}</td>
            <td>${item.members}</td>
            <td><span class="status-badge" style="background:#dcfce7; color:#166534;">${item.status}</span></td>
            <td><strong>${item.score.toLocaleString()}</strong></td>
        `;
        casesTableBody.appendChild(tr);
    });

    // ბოლო აქტივობების შევსება Dashboard-ზე
    recentList.innerHTML = '';
    casesData.slice(-3).reverse().forEach(item => {
        const div = document.createElement('div');
        div.className = 'recent-item';
        div.innerHTML = `
            <span><strong>${item.fullname}</strong> (${item.address})</span>
            <span>ქულა: <strong>${item.score.toLocaleString()}</strong></span>
        `;
        recentList.appendChild(div);
    });

    // LocalStorage-ში შენახვა
    localStorage.setItem('ssa_cases', JSON.stringify(casesData));
}

// 5. ფორმის გაგზავნა (ახალი დეკლარაცია)
socialForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const fullname = document.getElementById('fullname').value;
    const personalId = document.getElementById('personal-id').value;
    const address = document.getElementById('address').value;
    const members = parseInt(document.getElementById('members-count').value);
    const income = parseFloat(document.getElementById('income').value);
    const property = document.getElementById('property').value;
    const vulnerable = document.getElementById('vulnerable').value;

    const computedScore = calculateSocialScore(members, income, property, vulnerable);

    const newCase = {
        id: `SSA-${1000 + casesData.length + 1}`,
        fullname,
        address,
        members,
        income,
        property,
        vulnerable,
        score: computedScore,
        status: "შეფასებული"
    };

    casesData.push(newCase);
    updateUI();

    alert(`დეკლარაცია წარმატებით დარეგისტრირდა!\nსავარაუდო სოციალური ქულა: ${computedScore.toLocaleString()}`);

    socialForm.reset();
    
    // გადავიყვანოთ მომხმარებელი განაცხადების ცხრილზე
    document.querySelector('[data-tab="cases"]').click();
});

// საწყისი ჩატვირთვა
updateUI();
