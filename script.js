const SHEET_ID = "1LLdhtx3rJp1KkJ-sNo6FPQ4zOsxP1WLvxo5SKe0Kxvg"; // Replace with your Google Sheet ID
const API_KEY = "AIzaSyDqKeZVEAaZtYK6r6ikP1axHvM0LhswFu0"; // Replace with your Google API Key
const SHEET_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${API_KEY}`;

let currentPage = 1;
const ENTRIES_PER_PAGE = 25;

const loadingScreen = document.getElementById("loading-screen");

// Fetch Data Function
async function fetchData(page = 1) {
    loadingScreen.style.display = "flex"; // Show loading screen
    try {
        let res = await fetch(SHEET_URL);
        let data = await res.json();
        let rows = data.values.slice(1); // Exclude header row

        // Pagination logic
        let start = (page - 1) * ENTRIES_PER_PAGE;
        let end = start + ENTRIES_PER_PAGE;

        displayCases(rows.slice(start, end));
        calculateSummary(rows);
    } catch (err) {
        console.error("Error fetching data", err);
    } finally {
        loadingScreen.style.display = "none"; // Hide loading screen
    }
}

// Display Cases
function displayCases(rows) {
    let casesContainer = document.getElementById("cases");
    casesContainer.innerHTML = "";
    rows.forEach(row => {
        let caseDiv = document.createElement("div");
        caseDiv.classList.add("case");
        caseDiv.setAttribute("data-case", row[0]); // Case number

        // Status Styling
        let statusText = row[9]; // Status column
        let statusClass = "";
        if (statusText === "ফাঁসি হয়েছে") {
            statusClass = "green";
        } else if (statusText === "ফাঁসি হয়নি" || statusText === "শিশু") {
            statusClass = "red";
        } else if (statusText === "ধর্ষণের চেষ্টা") {
            statusClass = "yellow";
        }

        // Extra large for শিশু
        let extraLarge = statusText === "শিশু" ? "extra-large" : "";

        // Default image if no image link is provided
        let imageLink = row[1] ? row[1] : "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhR3D8Vc1vhgvr1-9t-F5maNzCpAkBPNqPGTegwWz1QhZMQgEeP_CY6p3w5FMNMVs9ijqg0GOqtGaAgDubR1iOo9c-7Ou_XBtbl4ahZq7oUfWx8MoB08lcxQG47nd5gs-VSVFJRh9vCWM3Ni27qlGHewvzXyP9GvQhptR9IwgXx8TqDmhXKXqXBG8KcMoM/s500/44889cdf-e551-4639-8307-2d2b0351ffd9_11zon_prev_ui.png";

        caseDiv.innerHTML = `
            <img src="${imageLink}" alt="${row[2]}">
            <h3>${row[2]}</h3>
            <p><strong>ধর্ষিতার নাম ও বয়স:</strong> ${row[3]}, ${row[4]}</p>
            <p><strong>ধর্ষক:</strong> ${row[5]}</p>
            <p><strong>ধর্ষকের ঠিকানা:</strong> ${row[7]}</p>
            <p><strong>ধর্ষণের তারিখ:</strong> ${row[8]}</p>
            <p><strong>Status:</strong> <span class="status ${statusClass} ${extraLarge}">${statusText}</span></p>
            <a href="${row[10]}" target="_blank">Details</a>
        `;
        casesContainer.appendChild(caseDiv);
    });
}
// Calculate Summary
function calculateSummary(rows) {
    // Fetch summary data from the Summary column (index 11)
    let summaryData = rows[0][11].split(","); // Split the summary column by commas

    // Extract values from the split array
    let totalCriminals = summaryData[0].trim(); // মোট ধর্ষক
    let attempts = summaryData[1].trim(); // ধর্ষণের চেষ্টা
    let unresolved = summaryData[2].trim(); // যতগুলো বিচার হয়নি

    // Update the summary buttons with the fetched data
    document.getElementById("totalCriminals").innerText = `আমাদের লিস্টে মোট ধর্ষক: ${totalCriminals}`;
    document.getElementById("attempts").innerText = `ধর্ষণের চেষ্টা: ${attempts}`;
    document.getElementById("unresolved").innerText = `যতগুলো বিচার হয়নি: ${unresolved}`;
}


// Search Functionality
document.getElementById("search").addEventListener("input", function () {
    let keyword = this.value.toLowerCase();
    let cases = document.querySelectorAll(".case");
    cases.forEach(div => {
        div.style.display = div.innerText.toLowerCase().includes(keyword) ? "" : "none";
    });
});

// Filter Functionality
document.querySelectorAll("#filters button").forEach(button => {
    button.addEventListener("click", function () {
        let filter = this.getAttribute("data-filter");
        let cases = document.querySelectorAll(".case");

        cases.forEach(div => {
            let caseData = div.innerText.toLowerCase();
            div.style.display = caseData.includes(filter.toLowerCase()) ? "" : "none";
        });
    });
});

// Next Button Logic
document.getElementById("loadMore").addEventListener("click", function () {
    currentPage++;
    fetchData(currentPage);
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top after loading more entries
});

// Initial Data Fetch
fetchData();