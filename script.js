document.addEventListener('DOMContentLoaded', function () {
  // Display the current year in the footer.
  const year = document.getElementById('year');
  if (year) {
    year.textContent = new Date().getFullYear();
  }
  const toast = document.getElementById('toast');
  let toastTimer;
  // Show a small notification.
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('show');
    }, 2800);
  }
  // Smooth scrolling for sections on this page.
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.length > 1) {
        const target = document.querySelector(targetId);
        if (target) {
          event.preventDefault();
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });
});
/* GradeMate sign-up page functionality */

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('signupForm');

  function setupPasswordToggle(inputId, buttonId) {
    const input = document.getElementById(inputId);
    const button = document.getElementById(buttonId);

    if (!input || !button) return;

    button.addEventListener('click', function () {
      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      button.textContent = isHidden ? 'Hide' : 'Show';

      button.setAttribute(
        'aria-label',
        isHidden ? 'Hide password' : 'Show password'
      );
    });
  }

  setupPasswordToggle('password', 'togglePassword');
  setupPasswordToggle('confirmPassword', 'toggleConfirmPassword');

  if (!form) return;

  const fullName = document.getElementById('fullName');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const confirmPassword = document.getElementById('confirmPassword');
  const message = document.getElementById('formMessage');
  const submitButton = form.querySelector('[type="submit"]');

    form.addEventListener('submit', async function (event) {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    message.className = 'form-message show';

    if (password.value !== confirmPassword.value) {
      message.textContent = 'Your passwords do not match. Please check them.';
      message.classList.add('error');
      confirmPassword.focus();
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    message.textContent = 'Creating your account...';
    message.classList.add('info');

    const { data, error } = await supabaseClient.auth.signUp({
      email: document.getElementById('email').value.trim(),
      password: password.value,
      options: {
        data: { full_name: document.getElementById('fullName').value.trim() }
      }
    });

    submitButton.disabled = false;
    message.className = 'form-message show';

    if (error) {
      message.textContent = error.message;
      message.classList.add('error');
      return;
    }

    localStorage.setItem('grademateSetupStarted', 'true');

    if (data.session) {
      // Email confirmation is off: the student is already signed in.
      window.location.href = 'onboardingpage.html';
    } else {
      // Email confirmation is on: they must confirm first.
      message.textContent =
        'Account created! Check your email and click the confirmation link, then log in.';
      message.classList.add('info');
    }
  });
});
/* GradeMate login page */
document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const loginPassword = document.getElementById("loginPassword");
    const toggleLoginPassword = document.getElementById("toggleLoginPassword");
    const loginMessage = document.getElementById("loginMessage");
    const forgotPasswordLink = document.getElementById("forgotPasswordLink");

    // Show or hide the password
    if (toggleLoginPassword && loginPassword) {
        toggleLoginPassword.addEventListener("click", function () {
            const isHidden = loginPassword.type === "password";
            loginPassword.type = isHidden ? "text" : "password";
            toggleLoginPassword.textContent = isHidden ? "Hide" : "Show";
            toggleLoginPassword.setAttribute(
                "aria-label",
                isHidden ? "Hide password" : "Show password"
            );
        });
    }

    // Handle login form
    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            if (!loginForm.checkValidity()) {
                loginForm.reportValidity();
                return;
            }

            loginMessage.style.color = "#4778f5";
            loginMessage.textContent = "Logging you in...";

            try {
                if (!supabaseClient) {
                    throw new Error("Supabase is not loaded on this page.");
                }

                const emailInput = loginForm.querySelector('input[type="email"]');

                const { error } = await supabaseClient.auth.signInWithPassword({
                    email: emailInput.value.trim(),
                    password: loginPassword.value
                });

                if (error) {
                    loginMessage.style.color = "#d93025";
                    loginMessage.textContent =
                        error.message === "Invalid login credentials"
                            ? "Email or password is incorrect."
                            : error.message;
                    return;
                }

                window.location.href = "dashboardpage.html";
            } catch (err) {
                loginMessage.style.color = "#d93025";
                loginMessage.textContent = err.message;
            }
        });
    }

    // Forgot password message
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener("click", function (event) {
            event.preventDefault();
            loginMessage.textContent =
                "Password recovery will be available when we connect account authentication.";
            loginMessage.style.color = "#4778f5";
        });
    }
});
/* GradeMate onboarding form */
document.addEventListener("DOMContentLoaded", function () {
    const onboardingForm = document.getElementById("onboardingForm");
    const onboardingMessage = document.getElementById("onboardingMessage");
    if (!onboardingForm) return;
    // Restore the last saved profile when returning to onboarding.
try {
    const savedProfile = JSON.parse(
        localStorage.getItem("grademateProfile") || "null"
    );

    if (savedProfile) {
        Object.entries(savedProfile).forEach(([key, value]) => {
            const field = document.getElementById(key);

            if (
                field &&
                value !== null &&
                value !== undefined
            ) {
                field.value = value;
            }
        });
    }
} catch (error) {
    console.error("Could not restore saved profile:", error);
}
    onboardingForm.addEventListener("submit", function (event) {
        event.preventDefault();
        if (!onboardingForm.checkValidity()) {
            onboardingForm.reportValidity();
            return;
        }
        const targetCgpaInput = document.getElementById("targetCgpa");
        const targetCgpa = targetCgpaInput.value.trim();
        if (targetCgpa !== "") {
            const cgpaNumber = Number(targetCgpa);
            if (!Number.isFinite(cgpaNumber) || cgpaNumber < 0 || cgpaNumber > 5) {
                onboardingMessage.textContent =
                    "Enter a target CGPA between 0 and 5.";
                onboardingMessage.style.color = "#d93025";
                return;
            }
        }
        const profile = {
            university: document.getElementById("university").value,
            faculty: document.getElementById("faculty").value.trim(),
            department: document.getElementById("department").value.trim(),
            admissionRoute: document.getElementById("admissionRoute").value,
            level: document.getElementById("level").value,
            session: document.getElementById("session").value,
            completedSemesters: document.getElementById("completedSemesters").value,
            targetClass: document.getElementById("targetClass").value,
            targetCgpa: targetCgpa === "" ? null : Number(targetCgpa),
            studyTime: document.getElementById("studyTime").value,
            studyHours: document.getElementById("studyHours").value
        };
        try {
            localStorage.setItem("grademateProfile", JSON.stringify(profile));
            onboardingMessage.textContent =
                "Profile saved on this device! Your information is ready for the next step.";
            onboardingMessage.style.color = "#16804a";
            setTimeout(function () {
                window.location.href = "dashboardpage.html";
            }, 700);
        } catch (error) {
            onboardingMessage.textContent =
                "Your browser couldn't save the profile. Please check your browser storage settings.";
            onboardingMessage.style.color = "#d93025";
        }
    });
});
/* GradeMate dashboard */
document.addEventListener("DOMContentLoaded", function () {
    const studentName = document.getElementById("studentName");
    // This code only runs on the dashboard page.
    if (!studentName) return;
    let profile;
    try {
        profile = JSON.parse(
            localStorage.getItem("grademateProfile") || "null"
        );
    } catch (error) {
        profile = null;
    }
    if (!profile) {
        studentName.textContent = "Student";
        document.getElementById("dashboardSubtitle").textContent =
            "Complete your profile to personalize your dashboard.";
        return;
    }
    const studentCourse = document.getElementById("studentCourse");
    const studentSchool = document.getElementById("studentSchool");
    const profileAvatar = document.getElementById("profileAvatar");
    studentCourse.textContent = profile.department || "Department not set";
    const levelDisplay = document.getElementById("dashboardStudentLevel");

if (levelDisplay) {
    levelDisplay.textContent = profile.level
        ? `${profile.level} Level`
        : "Level not set";
}
    studentSchool.textContent = profile.university || "University not set";
    // Use the saved name if one is added to the profile later.
    const name = profile.fullName || "Student";
    studentName.textContent = name;
    profileAvatar.textContent = name.charAt(0).toUpperCase();
    document.getElementById("dashboardSubtitle").textContent =
        "Your academic journey, organized in one place.";
    document.getElementById("dashboardTargetClass").textContent =
        profile.targetClass || "Not set yet";
    document.getElementById("dashboardTargetCgpa").textContent =
        profile.targetCgpa !== null && profile.targetCgpa !== undefined
            ? Number(profile.targetCgpa).toFixed(2)
            : "Not set yet";
    const hours = profile.studyHours || "3";
    document.getElementById("dashboardStudyHours").textContent =
        hours === "More than 6" ? "More than 6 hours" :
        hours + (hours === "1" ? " hour" : " hours");
    document.getElementById("dashboardStudyTime").textContent =
        profile.studyTime || "Not set yet";
});
/* GradeMate Academic Results System */
document.addEventListener("DOMContentLoaded", function () {
    const courseRows = document.getElementById("courseRows");
    // Provisional grading scale: confirm FUTA's applicable rules
    // before using this for official academic decisions.
    const gradePoints = {
        A: 5,
        B: 4,
        C: 3,
        D: 2,
        E: 1,
        F: 0
    };
    const storageKey = "grademateSemesterResults";
    if (!courseRows) return;
    const $ = (id) => document.getElementById(id);
    const levelInput = $("academicLevel");
    const semesterInput = $("academicSemester");
    const sessionInput = $("academicSession");
    const targetGpaInput = $("semesterTargetGpa");
    // Restore the last-used academic selections.
const academicSettingsKey = "grademateAcademicSettings";

function restoreAcademicSettings() {
    try {
        const settings = JSON.parse(
            localStorage.getItem(academicSettingsKey) || "{}"
        );

        if (levelInput && settings.level) {
            levelInput.value = settings.level;
        }

        if (semesterInput && settings.semester) {
            semesterInput.value = settings.semester;
        }

        if (sessionInput && settings.session) {
            sessionInput.value = settings.session;
        }
    } catch (error) {
        console.error("Could not restore academic settings:", error);
    }
}

function saveAcademicSettings() {
    try {
        localStorage.setItem(
            academicSettingsKey,
            JSON.stringify({
                level: levelInput.value,
                semester: semesterInput.value,
                session: sessionInput.value
            })
        );
    } catch (error) {
        console.error("Could not save academic settings:", error);
    }
}

restoreAcademicSettings();

[levelInput, semesterInput, sessionInput].forEach(input => {
    if (!input) return;

    input.addEventListener("change", function () {
        saveAcademicSettings();
    });
});
    let savedResults = loadResults();
    function loadResults() {
        try {
            const data = JSON.parse(
                localStorage.getItem(storageKey) || "[]"
            );
            return Array.isArray(data) ? deduplicate(data) : [];
        } catch (error) {
            return [];
        }
    }
    function deduplicate(results) {
        const unique = new Map();
        results.forEach((result) => {
            if (!result || !result.level ||
                !result.semester || !result.session) {
                return;
            }
            const key = resultKey(result);
            const existing = unique.get(key);
            if (
                !existing ||
                String(result.savedAt || "") >=
                String(existing.savedAt || "")
            ) {
                unique.set(key, result);
            }
        });
        return Array.from(unique.values());
    }
    function resultKey(result) {
        return [
            String(result.level).trim(),
            String(result.session).trim().toLowerCase(),
            String(result.semester).trim().toLowerCase()
        ].join("|");
    }
    function persistResults() {
        try {
            localStorage.setItem(
                storageKey,
                JSON.stringify(savedResults)
            );
            return true;
        } catch (error) {
            return false;
        }
    }
function renderSavedSemesters() {
    const list = $("savedSemestersList");
    const empty = $("savedResultsEmpty");
    if (!list || !empty) return;
    list.innerHTML = "";
    const sortedResults = [...savedResults].sort((a, b) => {
        return String(b.savedAt || "").localeCompare(
            String(a.savedAt || "")
        );
    });
    empty.hidden = sortedResults.length > 0;
    sortedResults.forEach(result => {
        const card = document.createElement("article");
        card.className = "saved-semester-card";
        const top = document.createElement("div");
        top.className = "saved-semester-top";
        const info = document.createElement("div");
        const heading = document.createElement("h3");
        heading.textContent =
            `${result.level} Level · ${result.semester} Semester`;
        const meta = document.createElement("p");
        meta.className = "saved-semester-meta";
        meta.textContent = `Session: ${result.session}` +
            (result.targetGpa !== null &&
             result.targetGpa !== undefined &&
             Number.isFinite(Number(result.targetGpa))
                ? ` · Target GPA: ${Number(result.targetGpa).toFixed(2)}`
                : "");
        info.append(heading, meta);
        const gpa = document.createElement("div");
        gpa.className = "saved-semester-gpa";
        gpa.textContent = Number(result.gpa).toFixed(2);
        top.append(info, gpa);
        const stats = document.createElement("div");
        stats.className = "saved-semester-stats";
        const courseCount = Array.isArray(result.courses)
            ? result.courses.length
            : 0;
        const coursesText = document.createElement("span");
        coursesText.textContent = `${courseCount} course(s)`;
        const unitsText = document.createElement("span");
        unitsText.textContent =
            `${result.totalUnits || 0} credit units`;
        stats.append(coursesText, unitsText);
        const actions = document.createElement("div");
        actions.className = "saved-semester-actions";
        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "saved-result-edit";
        editButton.textContent = "Open / Edit";
        editButton.addEventListener("click", function () {
            levelInput.value = String(result.level);
            semesterInput.value = result.semester;
            sessionInput.value = result.session;
            loadCurrentSemester();
            courseRows.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "saved-result-delete";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", function () {
            const confirmed = window.confirm(
                `Delete ${result.level} Level, ` +
                `${result.semester} Semester (${result.session})? ` +
                "This will permanently remove this saved result " +
                "from this device."
            );
            if (!confirmed) return;
            const keyToDelete = resultKey(result);
            savedResults = savedResults.filter(
                item => resultKey(item) !== keyToDelete
            );
            if (!persistResults()) {
                savedResults = loadResults();
                window.alert(
                    "We couldn't save that change. Please try again."
                );
                renderSavedSemesters();
                return;
            }
            const current = getCurrentContext();
            if (resultKey(current) === keyToDelete) {
                loadCurrentSemester();
            }
            if ($("semesterGoalFeedback")) {
                $("semesterGoalFeedback").hidden = true;
            }
            renderSavedSemesters();
            if ($("sessionResult")) $("sessionResult").hidden = true;
            if ($("cgpaResult")) $("cgpaResult").hidden = true;
            if ($("academicAdvice")) $("academicAdvice").hidden = true;
        });
        actions.append(editButton, deleteButton);
        card.append(top, stats, actions);
        list.appendChild(card);
    });
}
    function showMessage(message, type) {
        const box = $("resultsMessage");
        if (!box) return;
        box.textContent = message;
        box.className = "form-message show " + type;
    }
    function getCurrentContext() {
        return {
            level: levelInput.value,
            semester: semesterInput.value,
            session: sessionInput.value.trim()
        };
    }
        function findCurrentResult() {
        const context = getCurrentContext();
        return savedResults.find(
            result => resultKey(result) === resultKey(context)
        );
    }
    function gradeFromScore(score) {
        if (score >= 70) return "A";
        if (score >= 60) return "B";
        if (score >= 50) return "C";
        if (score >= 45) return "D";
        if (score >= 40) return "E";
        return "F";
    }
    function updateCourseCount() {
        const count = courseRows.querySelectorAll("tr").length;
        const countElement = $("courseCount");
        if (countElement) {
            countElement.textContent = count;
        }
    }
    function addCourseRow(course = {}) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>
                <input class="course-input course-code"
                    type="text" placeholder="e.g. IFS 201"
                    required>
            </td>
            <td>
                <input class="course-input course-units"
                    type="number" min="1" max="10" step="1"
                    placeholder="Units" required>
            </td>
            <td>
                <select class="course-select entry-method">
                    <option value="score">Score</option>
                    <option value="grade">Letter grade</option>
                </select>
            </td>
            <td>
                <input class="course-input course-value"
                    type="number" min="0" max="100" step="1"
                    placeholder="0–100" required>
            </td>
            <td class="course-grade">—</td>
            <td>
                <button type="button"
                    class="remove-course-btn"
                    aria-label="Remove course">✕</button>
            </td>
        `;
        const codeInput = row.querySelector(".course-code");
        const unitsInput = row.querySelector(".course-units");
        const methodInput = row.querySelector(".entry-method");
        const valueInput = row.querySelector(".course-value");
        const gradeCell = row.querySelector(".course-grade");
        function configureValueInput() {
            const isScore = methodInput.value === "score";
            valueInput.type = isScore ? "number" : "text";
            valueInput.min = isScore ? "0" : "";
            valueInput.max = isScore ? "100" : "";
            valueInput.step = isScore ? "1" : "";
            valueInput.placeholder = isScore
                ? "0–100"
                : "A, B, C, D, E or F";
        }
        methodInput.addEventListener("change", function () {
            valueInput.value = "";
            gradeCell.textContent = "—";
            configureValueInput();
        });
        valueInput.addEventListener("input", function () {
            gradeCell.textContent = "—";
        });
        row.querySelector(".remove-course-btn")
            .addEventListener("click", function () {
                const savedResult = findCurrentResult();
                row.remove();
                updateCourseCount();
                // If this semester already has saved results,
                // update the saved courses immediately.
                if (savedResult) {
                    const remainingRows = Array.from(
                        courseRows.querySelectorAll("tr")
                    );
                    // Recalculate and save only if every remaining
                    // course has valid information.
                    const remainingCourses = [];
                    let totalUnits = 0;
                    let totalPoints = 0;
                    let valid = true;
                    for (const courseRow of remainingRows) {
                        const code = courseRow
                            .querySelector(".course-code").value.trim();
                        const units = Number(courseRow
                            .querySelector(".course-units").value);
                        const method = courseRow
                            .querySelector(".entry-method").value;
                        const rawValue = courseRow
                            .querySelector(".course-value").value.trim();
                        if (!code || !Number.isInteger(units) ||
                            units < 1 || units > 10 || !rawValue) {
                            valid = false;
                            break;
                        }
                        let grade;
                        let value;
                        if (method === "score") {
                            value = Number(rawValue);
                            if (!Number.isFinite(value) ||
                                value < 0 || value > 100) {
                                valid = false;
                                break;
                            }
                            grade = gradeFromScore(value);
                        } else {
                            grade = rawValue.toUpperCase();
                            value = grade;
                            if (!Object.prototype.hasOwnProperty.call(
                                gradePoints, grade
                            )) {
                                valid = false;
                                break;
                            }
                        }
                        const points = gradePoints[grade];
                        remainingCourses.push({
                            code,
                            units,
                            method,
                            value,
                            grade,
                            points
                        });
                        totalUnits += units;
                        totalPoints += units * points;
                    }
                    // Save the removal only when the remaining entries
                    // are valid. If none remain, remove this semester's
                    // saved result altogether.
                    if (remainingRows.length === 0) {
                        savedResults = savedResults.filter(
                            result =>
                                resultKey(result) !== resultKey(savedResult)
                        );
                        persistResults();
                        if ($("gpaResult")) {
                            $("gpaResult").hidden = true;
                        }
                        showMessage(
                            "All courses removed. The saved semester result was deleted.",
                            "success"
                        );
                    } else if (valid) {
                        savedResult.courses = remainingCourses;
                        savedResult.totalUnits = totalUnits;
                        savedResult.totalPoints = totalPoints;
                        savedResult.gpa = Number(
                            (totalPoints / totalUnits).toFixed(2)
                        );
                        savedResult.savedAt = new Date().toISOString();
                        persistResults();
                        if ($("gpaResult")) {
                            $("gpaResult").hidden = true;
                        }
                        showMessage(
                            "Course removed and saved. Calculate GPA to view the updated result.",
                            "success"
                        );
                    } else {
                        showMessage(
                            "Course removed from the screen. Complete the remaining entries and calculate GPA to save the changes.",
                            "info"
                        );
                    }
                }
            });
        courseRows.appendChild(row);
        codeInput.value = course.code || "";
        unitsInput.value = course.units || "";
        // Older saved results may contain a grade but no raw score.
        methodInput.value = course.method ||
            (course.grade ? "grade" : "score");
        configureValueInput();
        if (course.value !== undefined && course.value !== null) {
            valueInput.value = course.value;
        } else if (course.grade) {
            valueInput.value = course.grade;
        }
        if (course.grade) {
            gradeCell.textContent = course.grade;
        }
        updateCourseCount();
    }
    function renderSemesterGoalFeedback(result) {
        const feedback = $("semesterGoalFeedback");
        const title = $("semesterGoalTitle");
        const message = $("semesterGoalText");
        const details = $("semesterGoalDetails");
        const courseAdvice = $("semesterGoalCourseAdvice");
        if (!feedback || !title || !message) return;
        if (courseAdvice) courseAdvice.replaceChildren();
        if (details) details.textContent = "";
        const target = result && result.targetGpa !== null &&
            result.targetGpa !== undefined
            ? Number(result.targetGpa)
            : NaN;
        if (!Number.isFinite(target) || target < 0 || target > 5) {
            feedback.hidden = true;
            return;
        }
        const actual = Number(result.gpa);
        const gap = target - actual;
        if (actual >= target) {
            title.textContent = "Excellent work — you met your target!";
            message.textContent =
                `Your GPA is ${actual.toFixed(2)}, meeting or exceeding ` +
                `your target of ${target.toFixed(2)}. You're moving ` +
                "closer to your academic goal. Keep up the good work!";
            if (details) {
                details.textContent =
                    `You reached your target by ${(actual - target).toFixed(2)} GPA point(s).`;
            }
        } else if (gap <= 0.20) {
            title.textContent = "You're close to your target — keep going!";
            message.textContent =
                `Your GPA is ${actual.toFixed(2)}, just ${gap.toFixed(2)} ` +
                `below your target of ${target.toFixed(2)}. A focused plan ` +
                "for your next semester can help you make progress.";
            if (details) {
                details.textContent =
                    "This 'close' range is a GradeMate guide, not an official university classification.";
            }
        } else {
            title.textContent = "You can build from here";
            message.textContent =
                `Your GPA is ${actual.toFixed(2)}, below your target of ` +
                `${target.toFixed(2)}. One result doesn't define you. ` +
                "Review the courses that need more attention and plan early for next semester.";
            if (details) {
                details.textContent =
                    `You are ${gap.toFixed(2)} GPA point(s) below your target.`;
            }
        }
        const courses = Array.isArray(result.courses) ? result.courses : [];
        const lowestCourses = courses
            .filter(course =>
                course && course.grade &&
                Number.isFinite(Number(
                    course.points !== undefined
                        ? course.points
                        : gradePoints[String(course.grade).toUpperCase()]
                ))
            )
            .map(course => ({
                ...course,
                numericPoints: Number(
                    course.points !== undefined
                        ? course.points
                        : gradePoints[String(course.grade).toUpperCase()]
                )
            }))
            .sort((a, b) =>
                a.numericPoints - b.numericPoints ||
                Number(b.units || 0) - Number(a.units || 0)
            )
            .slice(0, 3);
        if (courseAdvice && lowestCourses.length > 0) {
            const heading = document.createElement("h3");
            heading.textContent = "Courses to give extra attention";
            courseAdvice.appendChild(heading);
            const list = document.createElement("ul");
            lowestCourses.forEach(course => {
                const item = document.createElement("li");
                item.textContent =
                    `${course.code}: grade ${String(course.grade).toUpperCase()}. ` +
                    "Review the topics, practise questions, and ask for help where needed.";
                list.appendChild(item);
            });
            courseAdvice.appendChild(list);
        }
        feedback.hidden = false;
    }
        function loadCurrentSemester() {
        courseRows.innerHTML = "";
        const result = findCurrentResult();
        if (targetGpaInput) {
            targetGpaInput.value =
                result && result.targetGpa !== null &&
                result.targetGpa !== undefined &&
                Number.isFinite(Number(result.targetGpa))
                    ? String(result.targetGpa)
                    : "";
        }
        const goalFeedback = $("semesterGoalFeedback");
        if (goalFeedback) goalFeedback.hidden = true;
        if (result && Array.isArray(result.courses)) {
            result.courses.forEach(course => addCourseRow(course));
            showMessage(
                "Saved courses loaded. You can review or edit them.",
                "success"
            );
        } else {
            addCourseRow();
            showMessage(
                "Enter the courses for this semester.",
                "info"
            );
        }
        if ($("gpaResult")) $("gpaResult").hidden = true;
        if ($("sessionResult")) $("sessionResult").hidden = true;
        if ($("cgpaResult")) $("cgpaResult").hidden = true;
        if ($("academicAdvice")) $("academicAdvice").hidden = true;
    }
    function calculateCourses() {
        const rows = Array.from(courseRows.querySelectorAll("tr"));
        if (rows.length === 0) {
            showMessage("Add at least one course first.", "error");
            return;
        }
        const courses = [];
        let totalUnits = 0;
        let totalPoints = 0;
        for (const row of rows) {
            const code = row.querySelector(".course-code")
                .value.trim();
            const units = Number(
                row.querySelector(".course-units").value
            );
            const method = row.querySelector(".entry-method").value;
            const rawValue = row.querySelector(".course-value")
                .value.trim();
            const gradeCell = row.querySelector(".course-grade");
            if (!code || !Number.isInteger(units) ||
                units < 1 || units > 10 || !rawValue) {
                showMessage(
                    "Complete every course code, unit and grade/score.",
                    "error"
                );
                return;
            }
            let grade;
            let value;
            if (method === "score") {
                value = Number(rawValue);
                if (!Number.isFinite(value) ||
                    value < 0 || value > 100) {
                    showMessage(
                        "Scores must be between 0 and 100.",
                        "error"
                    );
                    return;
                }
                grade = gradeFromScore(value);
            } else {
                grade = rawValue.toUpperCase();
                if (!Object.prototype.hasOwnProperty.call(
                    gradePoints, grade
                )) {
                    showMessage(
                        "Use a valid letter grade: A, B, C, D, E or F.",
                        "error"
                    );
                    return;
                }
                value = grade;
            }
            const points = gradePoints[grade];
            gradeCell.textContent = grade;
            courses.push({
                code,
                units,
                method,
                value,
                grade,
                points
            });
            totalUnits += units;
            totalPoints += units * points;
        }
        let enteredTarget = null;
        if (targetGpaInput && targetGpaInput.value.trim() !== "") {
            enteredTarget = Number(targetGpaInput.value);
            if (!Number.isFinite(enteredTarget) ||
                enteredTarget < 0 || enteredTarget > 5) {
                showMessage(
                    "Your semester target GPA must be between 0 and 5.",
                    "error"
                );
                return;
            }
        }
        const context = getCurrentContext();
        if (!context.session) {
            showMessage(
                "Enter the academic session, e.g. 2025/2026.",
                "error"
            );
            return;
        }
        const gpa = totalPoints / totalUnits;
        const previousResult = findCurrentResult();
        // If the target field is left blank while editing a saved semester,
        // keep its existing target instead of accidentally deleting it.
        const targetGpa = enteredTarget !== null
            ? enteredTarget
            : (previousResult &&
               previousResult.targetGpa !== null &&
               previousResult.targetGpa !== undefined
                ? Number(previousResult.targetGpa)
                : null);
        const result = {
            ...context,
            targetGpa,
            courses,
            totalUnits,
            totalPoints,
            gpa: Number(gpa.toFixed(2)),
            savedAt: new Date().toISOString()
        };
        // Replace the existing result for this semester instead
        // of creating duplicates every time Calculate is clicked.
        savedResults = savedResults.filter(
            saved => resultKey(saved) !== resultKey(result)
        );
        savedResults.push(result);
        if (!persistResults()) {
            showMessage(
                "The result was calculated, but this device could not save it.",
                "error"
            );
            return;
        }
        renderSavedSemesters();
        renderSemesterGoalFeedback(result);
        if ($("gpaValue")) {
            $("gpaValue").textContent = result.gpa.toFixed(2);
        }
        if ($("totalUnits")) {
            $("totalUnits").textContent = totalUnits;
        }
        if ($("totalPoints")) {
            $("totalPoints").textContent = totalPoints.toFixed(2);
        }
        if ($("totalCourses")) {
            $("totalCourses").textContent = courses.length;
        }
        if ($("gpaResult")) $("gpaResult").hidden = false;
        showMessage(
            "GPA calculated and saved on this device. Your courses are saved too.",
            "success"
        );
        if ($("gpaResult")) {
            $("gpaResult").scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    }
    function calculateSessionGpa() {
        const level = levelInput.value;
        const sessionSelector = $("sessionToCalculate");
        const session = sessionSelector
            ? sessionSelector.value.trim()
            : sessionInput.value.trim();
        if (!session) {
            $("sessionMessage").textContent =
                "Enter the academic session first.";
            return;
        }
        const first = savedResults.find(result =>
            String(result.level) === String(level) &&
            result.session.trim().toLowerCase() ===
                session.toLowerCase() &&
            result.semester.toLowerCase().includes("first")
        );
        const second = savedResults.find(result =>
            String(result.level) === String(level) &&
            result.session.trim().toLowerCase() ===
                session.toLowerCase() &&
            result.semester.toLowerCase().includes("second")
        );
        if (!first || !second) {
            $("sessionResult").hidden = true;
            $("sessionMessage").textContent =
                "Save both First Semester and Second Semester results " +
                "for this level and session before calculating Session GPA.";
            return;
        }
        const units = first.totalUnits + second.totalUnits;
        const points = first.totalPoints + second.totalPoints;
        const gpa = points / units;
        $("sessionGpaValue").textContent = gpa.toFixed(2);
        $("sessionDetails").textContent =
            `${units} total credit units across both semesters.`;
        $("sessionResult").hidden = false;
        $("sessionMessage").textContent =
            "Session GPA calculated using total quality points divided by total units.";
    }
    function calculateCgpa() {
        if (savedResults.length === 0) {
            $("cgpaResult").hidden = true;
            $("cgpaMessage").textContent =
                "Calculate and save at least one semester result first.";
            return;
        }
        const totalUnits = savedResults.reduce(
            (sum, result) => sum + Number(result.totalUnits || 0), 0
        );
        const totalPoints = savedResults.reduce(
            (sum, result) => sum + Number(result.totalPoints || 0), 0
        );
        if (totalUnits <= 0) {
            $("cgpaMessage").textContent =
                "There are no valid saved credit units to calculate.";
            return;
        }
        const cgpa = totalPoints / totalUnits;
        $("cgpaValue").textContent = cgpa.toFixed(2);
        $("cgpaDetails").textContent =
            `${savedResults.length} saved semester(s), ` +
            `${totalUnits} total credit units.`;
        $("cgpaResult").hidden = false;
        $("cgpaMessage").textContent =
            "Your CGPA uses all saved semester results on this device.";
        showAcademicAdvice(cgpa);
        $("cgpaResult").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
    function showAcademicAdvice(cgpa) {
        const advice = $("academicAdvice");
        if (!advice) return;
        let profile = {};
        try {
            profile = JSON.parse(
                localStorage.getItem("grademateProfile") || "{}"
            );
        } catch (error) {
            profile = {};
        }
        const target = Number(profile.targetCgpa);
        if (profile.targetCgpa !== "" &&
            profile.targetCgpa !== null &&
            profile.targetCgpa !== undefined &&
            Number.isFinite(target) && target >= 0 && target <= 5) {
            if (cgpa >= target) {
                $("adviceTitle").textContent =
                    "You're on target — keep it up!";
                $("adviceText").textContent =
                    `Your current CGPA is ${cgpa.toFixed(2)}, meeting ` +
                    `your target of ${target.toFixed(2)}. Stay consistent ` +
                    "and keep reviewing your results each semester.";
                $("adviceAction").textContent =
                    "Keep following your study routine.";
            } else {
                $("adviceTitle").textContent =
                    "You still have room to improve";
                $("adviceText").textContent =
                    `Your current CGPA is ${cgpa.toFixed(2)}, while your ` +
                    `target is ${target.toFixed(2)}. Use your next semester ` +
                    "to build stronger study habits and improve your grades.";
                $("adviceAction").textContent =
                    "Review difficult courses and plan regular study sessions.";
            }
        } else {
            $("adviceTitle").textContent =
                "Keep building your academic progress!";
            $("adviceText").textContent =
                `Your current CGPA is ${cgpa.toFixed(2)}. Set a numerical ` +
                "CGPA target in your profile to receive more personalized advice.";
            $("adviceAction").textContent =
                "Keep tracking your results and studying consistently.";
        }
        advice.hidden = false;
    }
    $("addCourseBtn").addEventListener("click", function () {
        addCourseRow();
    });
    $("calculateGpaBtn").addEventListener("click", calculateCourses);
    $("editResultsBtn").addEventListener("click", function () {
        if ($("gpaResult")) $("gpaResult").hidden = true;
        courseRows.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
    $("calculateSessionBtn").addEventListener(
        "click",
        calculateSessionGpa
    );
    $("calculateCgpaBtn").addEventListener(
        "click",
        calculateCgpa
    );
    [levelInput, semesterInput, sessionInput].forEach(input => {
        input.addEventListener("change", loadCurrentSemester);
    });
    loadCurrentSemester();
    renderSavedSemesters();
});


/* GradeMate: Connect Dashboard to Academic Results */

(function () {
    function updateDashboardResults() {
        const dashboard = document.querySelector(".dashboard-page");

        // Run this code only on the dashboard page.
        if (!dashboard) return;

        const getElement = (id) => document.getElementById(id);

        function setText(id, value) {
            const element = getElement(id);
            if (element) element.textContent = value;
        }

        function readNumber(object, keys) {
            for (const key of keys) {
                const value = object?.[key];

                if (
                    value !== "" &&
                    value !== null &&
                    value !== undefined &&
                    Number.isFinite(Number(value))
                ) {
                    return Number(value);
                }
            }

            return null;
        }

        let results = [];
        let profile = {};

        try {
            results = JSON.parse(
                localStorage.getItem("grademateSemesterResults") || "[]"
            );

            profile = JSON.parse(
                localStorage.getItem("grademateProfile") || "{}"
            );

            if (!Array.isArray(results)) results = [];
            if (!profile || typeof profile !== "object") profile = {};
        } catch (error) {
            console.error("Could not read GradeMate saved data:", error);
        }

        // Keep only saved results containing usable academic information.
        const validResults = results.filter((result) => {
            const units = readNumber(result, [
                "totalUnits",
                "totalCourseUnits",
                "units"
            ]);

            const points = readNumber(result, [
                "totalPoints",
                "weightedPoints",
                "qualityPoints"
            ]);

            const gpa = readNumber(result, [
                "gpa",
                "semesterGpa",
                "semesterGPA"
            ]);

            return (
                result &&
                typeof result === "object" &&
                units !== null &&
                units > 0 &&
                (points !== null || gpa !== null)
            );
        });

        const savedCount = validResults.length;

        setText("dashboardSavedSemesters", savedCount);
        setText(
            "dashboardSemestersNote",
            savedCount === 1
                ? "1 semester result saved."
                : savedCount > 1
                    ? `${savedCount} semester results saved.`
                    : "No semester results saved yet."
        );

        if (savedCount === 0) {
            setText("dashboardCurrentCgpa", "—");
            setText(
                "dashboardCgpaNote",
                "Add your semester results to get started."
            );

            setText("dashboardLatestGpa", "—");
            setText(
                "dashboardLatestGpaNote",
                "Your latest result will appear here."
            );

            setText(
                "dashboardTargetProgress",
                "Save your semester results to track your progress."
            );

            return;
        }

        // Calculate CGPA using total grade points divided by total units.
        let allPoints = 0;
        let allUnits = 0;

        validResults.forEach((result) => {
            const units = readNumber(result, [
                "totalUnits",
                "totalCourseUnits",
                "units"
            ]);

            let points = readNumber(result, [
                "totalPoints",
                "weightedPoints",
                "qualityPoints"
            ]);

            const gpa = readNumber(result, [
                "gpa",
                "semesterGpa",
                "semesterGPA"
            ]);

            if (points === null && gpa !== null) {
                points = gpa * units;
            }

            allPoints += points;
            allUnits += units;
        });

        const currentCgpa = allUnits > 0
            ? allPoints / allUnits
            : null;

        setText(
            "dashboardCurrentCgpa",
            currentCgpa === null ? "—" : currentCgpa.toFixed(2)
        );

        setText(
            "dashboardCgpaNote",
            currentCgpa === null
                ? "Your saved results need checking."
                : "Based on your saved semester results."
        );

        // Find the most recently saved semester.
        const sortedResults = [...validResults].sort((a, b) => {
            const dateA = Date.parse(a.savedAt || a.updatedAt || "") || 0;
            const dateB = Date.parse(b.savedAt || b.updatedAt || "") || 0;
            return dateB - dateA;
        });

        const latestResult = sortedResults[0];

        const latestGpa = readNumber(latestResult, [
            "gpa",
            "semesterGpa",
            "semesterGPA"
        ]);

        setText(
            "dashboardLatestGpa",
            latestGpa === null ? "—" : latestGpa.toFixed(2)
        );

        const semesterName =
            latestResult.semesterName ||
            latestResult.semester ||
            "Latest saved semester";

        const sessionName =
            latestResult.session ||
            latestResult.academicSession ||
            "";

        setText(
            "dashboardLatestGpaNote",
            latestGpa === null
                ? "GPA not found in this saved result."
                : sessionName
                    ? `${semesterName} · ${sessionName}`
                    : `${semesterName}`
        );

        // Read the CGPA target from the student's saved profile.
        const targetCgpa = readNumber(profile, [
            "targetCgpa",
            "targetCGPA",
            "cgpaTarget",
            "targetCGPATarget"
        ]);

        if (
            targetCgpa !== null &&
            targetCgpa > 0 &&
            currentCgpa !== null
        ) {
            const gap = targetCgpa - currentCgpa;

            if (gap <= 0) {
                setText(
                    "dashboardTargetProgress",
                    `Excellent! Your current CGPA is ${currentCgpa.toFixed(2)}, and you've reached your target of ${targetCgpa.toFixed(2)}. Keep it up!`
                );
            } else {
                setText(
                    "dashboardTargetProgress",
                    `Your current CGPA is ${currentCgpa.toFixed(2)} out of your ${targetCgpa.toFixed(2)} target. You need ${gap.toFixed(2)} more CGPA points to reach your goal. Keep working steadily!`
                );
            }
        } else {
            setText(
                "dashboardTargetProgress",
                currentCgpa === null
                    ? "Your saved results need checking before progress can be calculated."
                    : "Your results are saved! Set a numerical CGPA target in your profile to track your progress."
            );
        }
    }

    document.addEventListener("DOMContentLoaded", updateDashboardResults);
    window.addEventListener("pageshow", updateDashboardResults);
})();


/* GradeMate: Semester GPA Target */
document.addEventListener("DOMContentLoaded", function () {
    const toggleButton = document.getElementById("toggleSemesterTarget");
    const targetForm = document.getElementById("semesterTargetForm");
    const semesterInput = document.getElementById("targetSemester");
    const gpaInput = document.getElementById("targetGpa");
    const targetDisplay = document.getElementById("dashboardSemesterTarget");
    const message = document.getElementById("semesterTargetMessage");

    if (!toggleButton || !targetForm || !semesterInput ||
        !gpaInput || !targetDisplay || !message) return;

    const storageKey = "grademateSemesterTargets";

    function getTargets() {
        try {
            return JSON.parse(localStorage.getItem(storageKey)) || [];
        } catch (error) {
            return [];
        }
    }

    function displayTarget() {
        const targets = getTargets();

        if (!targets.length) {
            targetDisplay.textContent =
                "Set your GPA goal and work towards it.";
            return;
        }

        targetDisplay.textContent = targets.map(function (target) {
            const semester = target.semester === "First Semester"
                ? "1st Semester" : "2nd Semester";

            return semester + " target: " +
                Number(target.gpa).toFixed(2) + " / 5.00";
        }).join("  •  ");
    }

    toggleButton.addEventListener("click", function () {
        targetForm.hidden = !targetForm.hidden;
        toggleButton.textContent = targetForm.hidden
            ? "Set my target" : "Close settings";
    });

    targetForm.addEventListener("submit", function (event) {
        event.preventDefault();

        if (gpaInput.value === "") {
            message.textContent = "Please enter your target GPA.";
            return;
        }

        const gpa = Number(gpaInput.value);

        if (!Number.isFinite(gpa) || gpa < 0 || gpa > 5) {
            message.textContent = "Enter a GPA between 0 and 5.";
            return;
        }

        const semester = semesterInput.value;
        const targets = getTargets();
        const index = targets.findIndex(function (target) {
            return target.semester === semester;
        });

        const target = { semester: semester, gpa: gpa };

        if (index >= 0) {
            targets[index] = target;
        } else {
            targets.push(target);
        }

        localStorage.setItem(storageKey, JSON.stringify(targets));

        message.textContent = "Your target has been saved!";
        displayTarget();
    });

    displayTarget();
});

/* GradeMate: Dark Mode Theme Toggle */
 (function () {
     const themeStorageKey = "grademateTheme";

    function getSavedTheme() {
         try {
             return localStorage.getItem(themeStorageKey) || "light";
         } catch (error) {
             return "light";
         }
     }

    function applyTheme(theme) {
         const isDark = theme === "dark";

        if (isDark) {
             document.documentElement.setAttribute("data-theme", "dark");
         } else {
             document.documentElement.removeAttribute("data-theme");
         }

        const button = document.getElementById("themeToggle");
         const icon = document.getElementById("themeIcon");

        if (icon) {
             icon.textContent = isDark ? "☀️" : "🌙";
         }

        if (button) {
             button.setAttribute(
                 "aria-label",
                 isDark ? "Switch to light mode" : "Switch to dark mode"
             );

            button.setAttribute("aria-pressed", String(isDark));
         }
     }

    applyTheme(getSavedTheme());

    document.addEventListener("DOMContentLoaded", function () {
         applyTheme(getSavedTheme());

        const button = document.getElementById("themeToggle");

        if (!button) return;

        button.addEventListener("click", function () {
             const isDark =
                 document.documentElement.getAttribute("data-theme") === "dark";

            const newTheme = isDark ? "light" : "dark";

            try {
                 localStorage.setItem(themeStorageKey, newTheme);
             } catch (error) {
                 // Theme switching can still work for this page.
             }

            applyTheme(newTheme);
         });
     });
 })();
 