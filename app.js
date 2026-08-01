// --- სოციალური აგენტის რეალური დეკლარირების ლოგიკა ---

// 1. საწყისი რეალისტური მონაცემები
const initialCases = [
    {
        id: "DEC-2026-8841",
        fullname: "მერაბ კახაძე",
        personalId: "01019012345",
        address: "თბილისი, სამგორი, ვარკეთილი 3, კორპ. 402",
        members: 5,
        score: 54200,
        status: "დახმარების მიმღები (<70k)"
    },
    {
        id: "DEC-2026-8842",
        fullname: "მაია ქავთარაძე",
        personalId: "01008054321",
        address: "ქუთაისი, ჭავჭავაძის გამზ. #45",
        members: 2,
        score: 118400,
        status: "ზღვარს ზემოთ (>100k)"
    }
];

let casesData = JSON.parse(localStorage.getItem('ssa_real_cases')) || initialCases;

// DOM
const navButtons = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');
const pageTitle = document.getElementById('page-title');
const socialForm = document.getElementById('social-form');
const casesTableBody = document.getElementById('cases-table-body');
const recentList = document.getElementById('recent-list');

// ტაბების გადართვა
navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        navButtons.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(targetTab).classList.add('active');
    });
});

// 2. რეალურთან მიახლოებული სარეიტინგო ქულის ალგორითმი (Formula Simulation)
function calculatePMTScore(data) {
    // საბაზო ინდექსი (სოციალურ-ეკონომიკური სიდუხჭირის ინდიკატორი)
    let score = 65000;

    // ა) შემოსავლები ერთ სულზე
    const totalIncome = data.salaryIncome + data.pensionIncome + data.remittance;
    const perCapitaIncome = totalIncome / data.members;
    score += perCapitaIncome * 45;

    // ბ) სოციალური და დემოგრაფიული ტვირთი
    if (data.childrenCount > 0) score -= (data.childrenCount * 4500);
    if (data.disabledCount > 0) score -= (data.disabledCount * 8000);
    if (data.elderlyCount > 0) score -= (data.elderlyCount * 3000);
    if (data.singleParent !== 'standard') score -= 6000;

    // გ) საცხოვრებელი პირობები
    if (data.housingStatus === 'rented') score -= 3000;
    if (data.housingStatus === 'emergency') score -= 12000;
    if (data.heating === 'wood' || data.heating === 'none') score -= 5000;
    if (data.sanitation === 'outside') score -= 4000;

    // დ) ოჯახის ქონება და ინდექსაცია (ქონება ზრდის ქულას)
    if (data.hasCar) score += 35000;
    if (data.hasAc) score += 12000;
    if (data.hasPc) score += 6000;
    if (data.hasWashing) score += 5000;
    if (data.hasTractor) score += 18000;

    // ე) სოფლის მეურნეობა
    score += (data.landArea * 4000);
    score += (data.livestock * 2500);

    // ვ) კომუნალური მოხმარება (მაღალი მოხმარება = მაღალი ქულა)
    score += (data.utilityCost * 80);

    // ქულის ფარგლები
    return Math.max(12000, Math.round(score));
}

// 3. UI განახლება
function updateUI() {
    document.getElementById('stat-total').textContent = casesData.length;
    
    const vulnerableCount = casesData.filter(c => c.score < 70000).length;
    document.getElementById('stat-vulnerable').textContent = vulnerableCount;

    const avgScore = Math.round(casesData.reduce((acc, curr) => acc + curr.score, 0) / casesData.length);
    document.getElementById('stat-avg-score').textContent = avgScore.toLocaleString();

    // ცხრილი
    casesTableBody.innerHTML = '';
    casesData.forEach(item => {
        let badgeColor = "#dcfce7";
        let textColor = "#15803d";

        if (item.score >= 70000 && item.score < 100000) {
            badgeColor = "#fef3c7";
            textColor = "#b45309";
        } else if (item.score >= 100000) {
            badgeColor = "#fee2e2";
            textColor = "#b91c1c";
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${item.id}</strong></td>
            <td>${item.fullname}</td>
            <td>${item.personalId}</td>
            <td>${item.address}</td>
            <td>${item.members}</td>
            <td><strong>${item.score.toLocaleString()}</strong></td>
            <td><span class="status-badge" style="background:${badgeColor}; color:${textColor};">${getStatusText(item.score)}</span></td>
        `;
        casesTableBody.appendChild(tr);
    });

    // ბოლო აქტივობები
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

    localStorage.setItem('ssa_real_cases', JSON.stringify(casesData));
}

function getStatusText(score) {
    if (score < 30000) return "სრული დახმარება + კვება";
    if (score < 57000) return "საარსებო შემწეობა";
    if (score < 70000) return "მიზნობრივი დახმარება (ბავშვები)";
    if (score < 100000) return "სამედიცინო დაზღვევა";
    return "ზღვარს ზემოთ";
}

// 4. ფორმის დამუშავება
socialForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = {
        fullname: document.getElementById('fullname').value,
        personalId: document.getElementById('personal-id').value,
        region: document.getElementById('region').value,
        address: document.getElementById('address').value,
        phone: document.getElementById('phone').value,
        members: parseInt(document.getElementById('members-count').value),
        childrenCount: parseInt(document.getElementById('children-count').value),
        elderlyCount: parseInt(document.getElementById('elderly-count').value),
        disabledCount: parseInt(document.getElementById('disabled-count').value),
        singleParent: document.getElementById('single-parent').value,
        housingStatus: document.getElementById('housing-status').value,
        housingArea: parseFloat(document.getElementById('housing-area').value),
        heating: document.getElementById('heating').value,
        sanitation: document.getElementById('sanitation').value,
        hasCar: document.getElementById('has-car').checked,
        hasFridge: document.getElementById('has-fridge').checked,
        hasWashing: document.getElementById('has-washing').checked,
        hasTv: document.getElementById('has-tv').checked,
        hasPc: document.getElementById('has-pc').checked,
        hasAc: document.getElementById('has-ac').checked,
        hasTractor: document.getElementById('has-tractor').checked,
        salaryIncome: parseFloat(document.getElementById('salary-income').value) || 0,
        pensionIncome: parseFloat(document.getElementById('pension-income').value) || 0,
        remittance: parseFloat(document.getElementById('remittance').value) || 0,
        utilityCost: parseFloat(document.getElementById('utility-cost').value) || 0,
        landArea: parseFloat(document.getElementById('land-area').value) || 0,
        livestock: parseInt(document.getElementById('livestock').value) || 0
    };

    const computedScore = calculatePMTScore(formData);

    const newCase = {
        id: `DEC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        fullname: formData.fullname,
        personalId: formData.personalId,
        address: `${formData.region}, ${formData.address}`,
        members: formData.members,
        score: computedScore,
        status: getStatusText(computedScore)
    };

    casesData.push(newCase);
    updateUI();

    alert(`დეკლარაცია დარეგისტრირდა!\n\nმიშენებული სარეიტინგო ქულა: ${computedScore.toLocaleString()}\nსტატუსი: ${getStatusText(computedScore)}`);

    socialForm.reset();
    document.querySelector('[data-tab="cases"]').click();
});

updateUI();
