<script setup>
import { useUserStore } from "@/stores/user";
import { onMounted } from "vue";
import courseOrProgramJSON from "./courseProgram.json";
import _ from "lodash";
const userStore = useUserStore();
const endpoint = ref(userStore.mainDevServer);
import moment from "moment";

onMounted(() => {
    addPreliminaries()
    // addSibling()
})

let limitCounterSibling = ref(0);
const lasallianGreetingsOfPeaceTab = ref(true);
const stepsTab = ref(false)
const submitAndCheckEmailTab = ref(false)
const preliminariesTab = ref()
const studentClassificationStatusList = ref(false);
const studentClassificationStatus = ref(true)
const studentNewStatus = ref(false);
const studentContinuingStatus = ref(false);

const startFilling = () => {
    lasallianGreetingsOfPeaceTab.value = false;
    stepsTab.value = true;
}

const courseOrProgramData = ref(courseOrProgramJSON);
const newStudent = ref({
    tracking_id: "TID" + moment().valueOf(),
    temporary_lsu_id_number: "-",
    student_lsu_id_number: "LSU221123265",
    data_privacy_notice_consent: {
        text: [
            'Data Privacy Notice',
            'La Salle University Ozamiz upholds the Republic Act No. 10173 known as "Data Privacy Act of 2012" which declares the policy of the State to protect the fundamental human right of privacy while ensuring free flow of information to promote innovation and growth.',
            'In line with this, we would like to have your consent to collect and process all relevant personal information. This may include the student’s personal identifiable information such as name, age, sex at birth, address, contact details, and other relevant (previous) school records, that are relevant for LSU Admissions and Scholarships Center processes. This may include endorsement of student data (if requested) to other Lasallian Schools, DLSP, CHED, Dep-Ed and other legitimate (government/non-government) agencies. Rest assured that information you share with us will be treated with utmost confidentiality.',
            'If you agree to the abovementioned, kindly click the agree button below siginfying your consent and willingness to participate in the process of the collection, use and release of your information to the authorized personnel for legitimate purposes stated above.',
            'Should you wish to withdraw your consent, please get in touch with us through our website www.lsu.edu.ph or email us at president@lsu.edu.ph.',
            'I have READ and UNDERSTOOD the above statements and AGREE to all its terms and conditions',
            'I am 18 years old or above'
        ],
        read_above_statements_terms_and_conditions: true,
        is_eighteen_years_old_or_above: true,
    },
    student_classification_status: [],
    preliminaries: [],
    admissions_list_filter: {
        senior_high_school_track: "-",
        program_applied: "-",
        college: "-",
        new_term: "Summer",
        new_academic_year: "A.Y. 2023-2024",
        last_academic_year_enrolled: "Select Academic Year",
        last_term_enrolled: "Select Term",
        name_of_previous_school: "-",
        previous_program_enrolled: "-",
        program: "-",
        total_units_earned: "0"
    },
    student_personal_info: {
        title: "Mr.",
        lastname: "Luna",
        firstname: "Juvanee",
        middlename: "Sabado",
        has_middlename: "yes",
        extension_or_suffix_name: "-",
        birth_sex: "Male",
        birth_date: "2001-01-20",
        age: "23",
        birth_order: "4th",
        birth_place: "Cebu",
        religion: "Adventist",
        citizenship: "filipino",
        civil_status: "Single",
        nationality: "Filipino",
        ethnicity: "Filipino",
    },
    student_tribal_or_indigenous_community: {
        option: 'yes',
        name: ''
    },
    student_contact_info: {
        permanent_living_home_address_category: {
            street_or_purok: "Manggahon",
            barangay_or_village: "Tinago",
            city_or_municipality: "Ozamiz",
            zipcode: "7200",
            province_or_state: "Misamis Occidental",
            region: "Region X",
            country: "Philippines",
        },
        the_same_address: {
            question: 'Is your current address the same as your permanent address entered above? Type below your current address if the answer is no.',
            answer: 'no'
        },
        current_or_present_living_home_address_category: {
            street_or_purok: "Matinud-anon",
            barangay_or_village: "Maningcol",
            city_or_municipality: "Ozamiz",
            zipcode: "7200",
            province_or_state: "Misamis Occidental",
            region: "Region X",
            country: "Philippines",
        },
        contact: {
            primary_number: "09210689089",
            alternate_number: "09210689089",
            personal_email_address: "jorenleeluna24@gmail.com",
            lsu_email_address: "juvaneeluna@lsu.edu.ph",
        }
    },
    alien_status_information: {
        citizenship: "-",
        visa_status: "-",
        last_day_of_authorized_stay: "-",
        agent_name: "-",
        passport_number: "-",
        passport_place_issued: "-",
        passport_date_issued: "2024-05-22",
        passport_date_of_expiry: "2024-05-22",
        acricard_date_issued: "2024-05-22",
        acricard_date_of_expiry: "2024-05-22",
        crts_date_issued: "2024-05-22",
        crts_date_of_expiry: "2024-05-22",
        ssp_date_issued: "2024-05-22",
        ssp_date_of_expiry: "2024-05-22",
    },
    father_personal_info: {
        vital_life_status: "living",
        lastname: "Luna",
        firstname: "Cirilito",
        middlename: "Medina",
        birth_date: "1974-07-21",
        age: "49",
        civil_status: "Separated",
    },
    father_contact_info: {
        permanent_living_home_address_category: {
            street_or_purok: "Manggahon",
            barangay_or_village: "Tinago",
            city_or_municipality: "Ozamiz",
            zipcode: "7200",
            province_or_state: "Misamis Occidental",
            region: "Region X",
            country: "Philippines",
        },
        the_same_address: {
            question: 'Is current address the same as permanent address entered above? Type below current address if the answer is no.',
            answer: 'no'
        },
        current_or_present_living_home_address_category: {
            street_or_purok: "Matinud-anon",
            barangay_or_village: "Maningcol",
            city_or_municipality: "Ozamiz",
            zipcode: "7200",
            province_or_state: "Misamis Occidental",
            region: "Region X",
            country: "Philippines",
        },
        contact: {
            number: '09293909878',
            email_address: 'cirilitoluna@gmail.com',
        }
    },
    father_employment_info: {
        highest_education_completed: "College Level",
        occupation: "Graphic Designer",
        employment_status: "Project Employment",
        gross_monthly_income: "₱12,030 to ₱24,060",
        employer_or_company: "Graphix Mind",
    },
    mother_personal_info: {
        vital_life_status: "living",
        lastname: "Sabado",
        firstname: "Noreen",
        middlename: "Quijano",
        birth_date: "1974-10-12",
        age: "49",
        civil_status: "Separated",
    },
    mother_contact_info: {
        permanent_living_home_address_category: {
            street_or_purok: "Manggahon",
            barangay_or_village: "Tinago",
            city_or_municipality: "Ozamiz",
            zipcode: "7200",
            province_or_state: "Misamis Occidental",
            region: "Region X",
            country: "Philippines",
        },
        the_same_address: {
            question: 'Is current address the same as permanent address entered above? Type below current address if the answer is no.',
            answer: 'no'
        },
        current_or_present_living_home_address_category: {
            street_or_purok: "Matinud-anon",
            barangay_or_village: "Maningcol",
            city_or_municipality: "Ozamiz",
            zipcode: "7200",
            province_or_state: "Misamis Occidental",
            region: "Region X",
            country: "Philippines",
        },
        contact: {
            number: '09293909878',
            email_address: 'noreensabado@gmail.com',
        }
    },
    mother_employment_info: {
        highest_education_completed: "College Graduate",
        occupation: "Nurse",
        employment_status: "Regular Employment",
        gross_monthly_income: "₱12,030 to ₱24,060",
        employer_or_company: "Dental One",
    },
    legal_guardian_personal_info: {
        relation_to_student: "Eldest Sister",
        lastname: "Luna",
        firstname: "Jo Renlee",
        middlename: "Sabado",
        birth_date: "1996-06-24",
        age: "27",
        civil_status: "Single",
    },
    legal_guardian_contact_info: {
        permanent_living_home_address_category: {
            street_or_purok: "Manggahon",
            barangay_or_village: "Tinago",
            city_or_municipality: "Ozamiz",
            zipcode: "7200",
            province_or_state: "Misamis Occidental",
            region: "Region X",
            country: "Philippines",
        },
        the_same_address: {
            question: 'Is current address the same as permanent address entered above? Type below current address if the answer is no.',
            answer: 'no'
        },
        current_or_present_living_home_address_category: {
            street_or_purok: "Matinud-anon",
            barangay_or_village: "Maningcol",
            city_or_municipality: "Ozamiz",
            zipcode: "7200",
            province_or_state: "Misamis Occidental",
            region: "Region X",
            country: "Philippines",
        },
        contact: {
            number: '09210689089',
            email_address: 'jorenleeluna24@gmail.com',
        }
    },
    legal_guardian_employment_info: {
        highest_education_completed: "College Graduate",
        occupation: "Software Engineer",
        employment_status: "Regular Employment",
        gross_monthly_income: "₱84,210 to ₱144,360",
        employer_or_company: "La Salle University - Ozamiz",
    },
    student_emergency_contact_information: {
        personal_info: {
            title: "Ms.",
            lastname: "Luna",
            firstname: "Jo Renlee",
            middlename: "Sabado",
            extension_or_suffix_name: "-",
            relation_to_student: "Eldest Sister",
        },
        address: {
            street_or_purok: "Matinud-anon",
            barangay_or_village: "Maningcol",
            city_or_municipality: "Ozamiz",
            zipcode: "7200",
            province_or_state: "Misamis Occidental",
            region: "Region X",
            country: "Philippines",
        },
        contact: {
            primary_number: "09210689089",
            alternate_number: "09210689089",
            email_address: "jorenlee.luna@lsu.edu.ph"
        }
    },
    siblings: [
    ],
    student_educational_info: {
        tab: [
            'PRESCHOOL',
            'ELEMENTARY',
            'JUNIOR HIGH',
            'ALS',
            'SENIOR HIGH',
            'COLLEGE',
            'GRADUATE STUDIES'
        ],
        details: [
            {
                education_level: 'PRESCHOOL',
                name_of_previous_school: "-",
                track_or_program: "-",
                highest_honors_received: "-",
                city_or_municipality_and_province: "-",
                year_graduated_or_attended: "-",
            },
            {
                education_level: 'ELEMENTARY',
                name_of_previous_school: "-",
                track_or_program: "-",
                highest_honors_received: "-",
                city_or_municipality_and_province: "-",
                year_graduated_or_attended: "-",
            }
        ],
    },
    student_education_information_number: {
        learner_reference_number: '-',
        ched_award_number: '-',
        dswd_household_number: '-'
    },
    student_choice: {
        choice_track_program_one_course_program: "Bachelor of Science in Information Technology (BSIT)",
        choice_track_program_two_course_program: "Bachelor of Science in Information Technology (BSIT)",
        choice_track_program_three_course_program: "Bachelor of Science in Information Technology (BSIT)",
    },
    how_you_learn_about_lsu: {
        question: 'How did you first/initially learn about LSU?',
        list_items: [
            {
                label: 'Family or Friends',
                value: true,
                description: ''
            },
            {
                label: 'Career Talk or School Visit',
                value: true,
                description: ''
            },
            {
                label: 'Internet',
                value: true,
                description: ''
            },
            {
                label: 'Others',
                value: false,
                description: ''
            }
        ],
    },
    reasons_for_choosing_lsu: {
        question: 'Reason(s) for choosing LSU?',
        list_items: [
            {
                label: 'Quality Education',
                value: true,
                description: ''
            },
            {
                label: 'To Boost Career Prospects',
                value: true,
                description: ''
            },
            {
                label: 'Offers Scholarships',
                value: true,
                description: ''
            },
            {
                label: 'Others',
                value: false,
                description: ''
            }
        ],
    },
    household_capacity_and_access_to_distance_learning: [
        {
            question: '1. How do you go to school? (Check all that apply.)',
            list_items: [
                {
                    label: 'Walking',
                    value: true,
                    description: ''
                },
                {
                    label: 'Public Commute (water/land)',
                    value: true,
                    description: ''
                },
                {
                    label: 'Family-Owned Vehicle',
                    value: true,
                    description: ''
                },
                {
                    label: 'Others',
                    value: false,
                    description: ''
                }
            ],
        },
        {
            question: '2. Do you have access to the internet?',
            list_items: [
                {
                    label: 'Yes',
                    value: true,
                    description: ''
                }
            ],
        },
        {
            question: '3. How do you connect to the internet? (Check all that apply.)',
            list_items: [
                {
                    label: 'Own broadband internet (e.g. DSL)',
                    value: true,
                    description: ''
                },
                {
                    label: 'Own mobile data',
                    value: true,
                    description: ''
                },
                {
                    label: 'Others',
                    value: false,
                    description: ''
                }
            ],
        },
        {
            question: '4. What devices are available at home you can use for learning? (Check all that apply.)',
            list_items: [
                {
                    label: 'Desktop Computer',
                    value: false,
                    description: ''
                },
                {
                    label: 'Laptop',
                    value: true,
                    description: ''
                },
                {
                    label: 'Tablet',
                    value: false,
                    description: ''
                },
                {
                    label: 'Smartphone',
                    value: true,
                    description: ''
                },
                {
                    label: 'Others',
                    value: false,
                    description: ''
                }
            ],
        },
        {
            question: '5. Living arrangement while attending/enrolled in LSU. (Check all that apply.)',
            list_items: [
                {
                    label: 'Own House',
                    value: false,
                    description: ''
                },
                {
                    label: 'Boarding House',
                    value: false,
                    description: ''
                },
                {
                    label: 'With a Relative',
                    value: false,
                    description: ''
                },
                {
                    label: 'University dormitory',
                    value: false,
                    description: ''
                },
                {
                    label: 'Others',
                    value: true,
                    description: 'Apartment'
                }
            ],
        },
        {
            question: '6. Who among the household members can provide you with instructional support during distance learning? (Check all that apply.)',
            list_items: [
                {
                    label: 'Parents/Guardians',
                    value: false,
                    description: ''
                },
                {
                    label: 'Older siblings',
                    value: true,
                    description: ''
                },
                {
                    label: 'Extended member(s) of the family',
                    value: false,
                    description: ''
                },
                {
                    label: 'Able to do independent learning',
                    value: false,
                    description: ''
                },
                {
                    label: 'Others',
                    value: false,
                    description: ''
                }
            ],
        },
        {
            question: '7. Please indicate if you have experienced any of these challenges with distance learning. (Check all that apply.)',
            list_items: [
                {
                    label: 'Conflict with other responsibilities in the house (e.g., taking care of a family member, house chores).',
                    value: false,
                    description: ''
                },
                {
                    label: 'Problems with technology (e.g., lack of internet access, unreliable device/ internet, issues with log in, inssuficient load allowance, etc.).',
                    value: false,
                    description: ''
                },
                {
                    label: 'Distractions (e.g. noise from community/neighbor, social media etc.)',
                    value: false,
                    description: ''
                },
                {
                    label: 'Difficulty in independent learning',
                    value: false,
                    description: ''
                },
                {
                    label: 'High electrical consumption',
                    value: false,
                    description: ''
                },
                {
                    label: 'Others',
                    value: false,
                    description: ''
                }
            ],
        },
        {
            question: '8. Please indicate if you have experienced any of these positive experiences with distance learning. (Check all that apply.)',
            list_items: [
                {
                    label: 'My parents/caregivers/siblings helped me with homework.',
                    value: false,
                    description: ''
                },
                {
                    label: 'I was able to learn better than I did with traditional full in-person classes.',
                    value: false,
                    description: ''
                },
                {
                    label: 'I was not tired from having to travel to and from school.',
                    value: true,
                    description: ''
                },
                {
                    label: 'Reduced overall expenses (meals, transportation, etc.)',
                    value: true,
                    description: ''
                },
                {
                    label: 'Others',
                    value: false,
                    description: ''
                }
            ],
        }
    ],
    has_health_condition: {
        text: [
            'Support for Students with Health Conditions:',
            'Sharing the current state of your health will provide relevant information for us to understand your needs, and help us provide the necessary support for you to succeed at the University, and in life. The University, through the Career and Counseling Center (CCC) would like to provide further support by asking if you have needs due to any of the following disabilities consistent with the pertinent definitions used in the Implementing Rules and Regulations of RA 9442 and RA 7277 (otherwise known as the Magna Carta for Disabled Persons and for other Purposes)',
            '(1) Psychosocial and behavioral disability, (2) Chronic illness with disability, (3) Learning (cognitive or intellectual) disability, (4) Mental disability, (5) Visual/seeing disability, (6) Orthopedic/moving, and (7) Communication disability.',
            'Depending on the outcome of the initial interview, a confidential meeting with the appropriate school members may be arranged in order to discuss possible support for you.',
            'PLEASE NOTE THAT YOU MAY CHOOSE TO SKIP THIS ITEM. THE UNIVERSITY RESPECT EACH LEARNER S DESIRE FOR CONFIDENTIALITY.',
            'I have a health condition and I am interested in the student support service(s) offered by the University.'
        ],
        answer: false,
    },
    hereby_certification: {
        text: [
            'By clicking the box below, I hereby:',
            'Certify that all information  written in this application is complete and accurate. If accepted as  a student, I agree that my admission, registration, and graduation are subject to  the rules and regulations of La Salle University - Ozamiz.',
            'I have READ, UNDERSTOOD  the above statements and AGREE to all its terms and conditions. I understand that checking of the box shall be interpreted as constituting a signature of certification of the above-mentioned. '
        ],
        answer: true
    },
    media_release_consent: {
        text: [
            'By clicking the AGREE box below,',
            'I hereby:',
            'Give my consent to LSU the right to take and use photographs/film of me in all forms, media, and manner, in conjunction with my name or anonymize the data, for advertising, trade, promotion, exhibition, in the pursuit of promoting the projects and activities of LSU.',
            'Examples of LSU school-related activities/events and publications include but are not limited to:',
            'Subject to my right to withdraw and cancel my consent and permission as provided below, I waive any right to review, approve or disapprove the use of the photographs/films/videos for the promotion of the projects and activities of LSU, now and in the future, regardless of whether that use of manner is known to me.',
            'I consent to the provisions of this form and acknowledge the ownership by the LSU of the contents to be uploaded to the official websites, family, student, and employee portals, as well as official social media accounts of the LSU and Lasallian Formation and Mission Department s affiliated social media accounts.',
            'I understand that I will not be given to the media/press or public without my prior consent. I also understand that I have the right to withdraw and cancel my consent and permission at any time by notice in writing to president@lsu.edu.ph. Beginning from the date of my withdrawal of consent, LSU will take all reasonable steps to ensure that the photographs/films/videos of my child will no longer be used for the promotion of LSU projects and activities.',
            'I agree to use any media containing information of other persons, such as photos and videos during School event/s, for purely personal uses and purposes, with no connection to any professional, business, official, or commercial activity, and in compliance with the Data Privacy Act of the Philippines and any of its amendments and implementing rules and regulations.',
            'I agree to use any media containing information of other persons, such as photos and videos during School event/s, for purely personal uses and purposes, with no connection to any professional, business, official, or commercial activity, and in compliance with the Data Privacy Act of the Philippines and any of its amendments and implementing rules and regulations.',
            'By providing LSU your permission, the student’s names and/or likenesses, photos, video, and/or audio may be used in LSU school-related publication in print, analog or digital media.',
            'I have READ, UNDERSTOOD  the above statements and to all its terms and conditions. I understand that checking of the box shall be interpreted as constituting a signature of consent of the above-mentioned.'
        ],
        list: [
            'Audio and video recordings for cultural, formation, spiritual, and sports events such as PEP Rally and Vision Mission Week, or school events',
            'Officially recognized activities and events the Lasallian Mission and Office of the University Chancellor, student clubs, and student organizations',
            'Seminars-Workshops, Talks, and Training,',
            'Retreat, Recollection, Outreach/In-Reach, Service Learning, and Volunteer Activities',
            'Awards Ceremonies',
            'Cultural Production like concerts and plays',
            'Sports activity programs or sheets, such as for basketball, showing the weight and height of students',
            'Student Publication',
            'Name and picture in the LSU yearbook',
            'Honor roll and other recognition lists and programs',
            'Graduation programs and announcements',
            'Student photographs for classroom, teacher, or reports for school use',
            'Graduation Ball/Party',
            'Marketing Brochures',
            'Websites',
            'LSU Official Social Media Accounts Posts',
            'Videos for internal or external use, promotional media (local and national news), and other marketing and communication materials',
        ],
        answer: ''
    },
    statuses: [
        {
            category: '',
            process: '',
            value: '',
        }
    ],
    enrollment_tracking_status: [
        {
            track_name: 'admissions',
            label: 'admission',
            details: 'Requirements',
            date_checked: '-',
            check_by: '-',
            status: '',
            remarks: ''
        },
        {
            track_name: 'advising',
            label: 'advising',
            details: 'Course Subjects ',
            date_checked: '-',
            check_by: '-',
            status: '',
            remarks: ''
        },
        {
            track_name: 'accounting',
            label: 'payment',
            details: 'payment',
            date_checked: '-',
            check_by: '-',
            status: '',
            remarks: ''
        },
        {
            track_name: 'registration',
            label: 'enrollment',
            details: 'certificate of enrollment',
            date_checked: '-',
            check_by: '-',
            status: '',
            remarks: ''
        },
        {
            track_name: 'evaluation',
            label: 'evaluation',
            details: 'survey',
            date_checked: '',
            check_by: '-',
            status: '',
            remarks: ''
        }
    ],
    documents: ["-"],
    created_at: new Date().toDateString(),
})

const newStudentSubmitToEmail = ref({
    tracking_id: newStudent.value.tracking_id,
    temporary_lsu_id_number: newStudent.value.temporary_lsu_id_number,
    student_lsu_id_number: newStudent.value.student_lsu_id_number,
    firstname: newStudent.value.student_personal_info.firstname,
    email: newStudent.value.student_contact_info.contact.personal_email_address,
    lsu_email: newStudent.value.student_contact_info.contact.lsu_email_address,
})

const educationalActiveTabFilter = ref();
const currentEducationalTab = ref();

const expandEducationalDetails = (tab) => {
    if (newStudent.value.student_educational_info.details.find(param => param.education_level === tab)) {
        educationalActiveTabFilter.value = newStudent.value.student_educational_info.details.filter(param => param.education_level === tab)

        currentEducationalTab.value = tab;
    }
    else {
        newStudent.value.student_educational_info.details.push(
            {
                education_level: tab,
                name_of_previous_school: "-",
                track_or_program: "-",
                highest_honors_received: "-",
                city_or_municipality_and_province: "-",
                year_graduated_or_attended: "-",
            }
        )
    }
}

const preliminariesTabCategoryNew = (category) => {
    preliminariesTab.value = null;
    studentClassificationStatusList.value = true;
    studentClassificationStatus.value = false;
    studentNewStatus.value = true;
    studentContinuingStatus.value = false;
    newStudent.value.student_classification_status = [
        'NEW FRESHMAN',
        'TRANSFEREE',
    ]
}

const preliminariesTabCategoryContinuing = (category) => {
    preliminariesTab.value = null;
    studentClassificationStatusList.value = true;
    studentClassificationStatus.value = false;
    studentNewStatus.value = false;
    studentContinuingStatus.value = true;
    newStudent.value.student_classification_status = [
        'CONTINUING',
        'RETURNEE',
        'CONTINUING (change program)',
        'RETURNEE (change program)'
    ]
}

const addSibling = () => {
    newStudent.value.siblings.push(
        {
            lastname: "Luna",
            firstname: "Jo Renlee",
            middlename: "Sabado",
            birth_date: "1996-06-24",
            age: "27",
            civil_status: "Single",
            grade_or_year_level: "N/A",
            school_or_graduated_from: "La Salle University - Ozamiz",
            highest_education_completed: "College Graduate",
            occupation: "Software Engineer",
            employer_or_company: "La Salle University - Ozamiz",
        },
        {
            lastname: "Luna",
            firstname: "Jo Renlee",
            middlename: "Sabado",
            birth_date: "1996-06-24",
            age: "27",
            civil_status: "Single",
            grade_or_year_level: "N/A",
            school_or_graduated_from: "La Salle University - Ozamiz",
            highest_education_completed: "College Graduate",
            occupation: "Software Engineer",
            employer_or_company: "La Salle University - Ozamiz",
        }
    )
    limitCounterSibling.value--;
}

const displayPreliminaries = (tab) => {
    preliminariesTab.value = tab;
    newStudent.value.preliminaries.filter(param => param.category === tab)
}

const addPreliminaries = () => {
    newStudent.value.preliminaries = [
        {
            category: 'NEW FRESHMAN',
            list: {
                student_classifications: 'New Freshman',
                descriptions: 'A student who is eligible for admission to an undergaduate program after the completion of the K to 12 curriculum or its equivalent.',
                follow_up_questions_one: 'Did you graduate senior highschool from La Salle University - Basic Education?',
                answers_one: '',
                follow_up_questions_two: 'Please indicate the year and term you Last Enrolled in LSU Basic Education:',
            }
        },
        {
            category: 'TRANSFEREE',
            list: {
                student_classifications: 'Transferee',
                descriptions: 'An undergraduate student known to have attended a different college/university prior to seeking admission to the University.',
                follow_up_questions_one: 'Were you enrolled in an undergraduate program in La Salle University before?',
                answers_one: '',
                follow_up_questions_two: 'Please indicate the year and term you Last Enrolled in LSU:',
            }
        },
        {
            category: 'CONTINUING',
            list: {
                student_classifications: 'Continuing',
                descriptions: 'An undergraduate student who is currently enrolled and/or whose studies in LSU is uninterrupted and intends on continuing their program studies in LSU.',
                follow_up_questions_one: 'Do you intend to apply for a change of program?',
                answers_one: 'No',
                follow_up_questions_two: 'Please indicate the year and term you Last Enrolled in LSU:',
            }
        },
        {
            category: 'CONTINUING (change program)',
            list: {
                student_classifications: 'Continuing (change of program)',
                descriptions: 'An undergraduate student who is currently enrolled and/or whose studies in LSU is uninterrupted and intends on continuing their program studies in LSU.',
                follow_up_questions_one: 'Do you intend to apply for a change of program?',
                answers_one: 'Yes',
                follow_up_questions_two: 'Please indicate the year and term you Last Enrolled in LSU:',
            }
        },
        {
            category: 'RETURNEE',
            list: {
                student_classifications: 'Returnee',
                descriptions: 'An undergraduate student of LSU whose studies was discontinued for at least one (1) semester and is seeking re-admission to the University.',
                follow_up_questions_one: 'Do you intend to apply for a change of program?',
                answers_one: 'No',
                follow_up_questions_two: 'Please indicate the year and term you Last Enrolled in LSU:',
            }
        },
        {
            category: 'RETURNEE (change program)',
            list: {
                student_classifications: 'Returnee (change of program)',
                descriptions: 'An undergraduate student of LSU whose studies was discontinued for at least one (1) semester and is seeking re-admission to the University.',
                follow_up_questions_one: 'Do you intend to apply for a change of program?',
                answers_one: 'Yes',
                follow_up_questions_two: 'Please indicate the year and term you Last Enrolled in LSU:',
            }
        }
    ]
}

const removeRowSibling = (obj) => {
    if (newStudent.value.siblings.length > 0) {
        _.pull(newStudent.value.siblings, obj);
        limitCounterSibling.value++;
    }
}

const ageRange = ref([
    10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
    26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41,
    42, 43, 44, 45, 46, 47, 48, 49, 50
])

const birthOrderList = ref([
    '1st', '2nd', '3rd', '4th', '5th', 'Nth'
])

const civilStatusList = ref([
    'Single',
    'Married',
    'Separated',
    'Divorced',
    'Widowed'
])

const toggle = ref({
    preliminaries: true,
    studentInfo: false,
    familyInfo: false,
    education: false,
    survey: false,
    certification: false,
})

const toggleInfo = (a, b, c, d, e, f) => {
    toggle.value = {
        preliminaries: a,
        studentInfo: b,
        familyInfo: c,
        education: d,
        survey: e,
        certification: f,
    }
}

const theSameAddressBtn = (choice) => {
    if (choice === 'yesStudentContactInfo') {
        newStudent.value.student_contact_info.the_same_address.answer = 'yes'
        newStudent.value.student_contact_info.current_or_present_living_home_address_category = newStudent.value.student_contact_info.permanent_living_home_address_category
        // console.log(newStudent.value)
    }
    if (choice === 'noStudentContactInfo') {
        newStudent.value.student_contact_info.the_same_address.answer = 'no'
        newStudent.value.student_contact_info.current_or_present_living_home_address_category = {}
    }
    if (choice === 'yesFatherContactInfo') {
        newStudent.value.father_contact_info.the_same_address.answer = 'yes'
        newStudent.value.father_contact_info.current_or_present_living_home_address_category = newStudent.value.father_contact_info.permanent_living_home_address_category
        // console.log(newStudent.value)
    }
    if (choice === 'noFatherContactInfo') {
        newStudent.value.father_contact_info.the_same_address.answer = 'no'
        newStudent.value.father_contact_info.current_or_present_living_home_address_category = {}
    }
    if (choice === 'yesMotherContactInfo') {
        newStudent.value.mother_contact_info.the_same_address.answer = 'yes'
        newStudent.value.mother_contact_info.current_or_present_living_home_address_category = newStudent.value.mother_contact_info.permanent_living_home_address_category
        // console.log(newStudent.value)
    }
    if (choice === 'noMotherContactInfo') {
        newStudent.value.mother_contact_info.the_same_address.answer = 'no'
        newStudent.value.mother_contact_info.current_or_present_living_home_address_category = {}
    }
    if (choice === 'yesGuardianContactInfo') {
        newStudent.value.legal_guardian_contact_info.the_same_address.answer = 'yes'
        newStudent.value.legal_guardian_contact_info.current_or_present_living_home_address_category = newStudent.value.legal_guardian_contact_info.permanent_living_home_address_category
        // console.log(newStudent.value)
    }
    if (choice === 'noGuardianContactInfo') {
        newStudent.value.legal_guardian_contact_info.the_same_address.answer = 'no'
        newStudent.value.legal_guardian_contact_info.current_or_present_living_home_address_category = {}
    }
}

const submitFunc = async () => {
    await $fetch(endpoint.value + "/api/admissions/create/",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: newStudent.value,
        }
    ).then((response) => {
        // console.log(response);
        lasallianGreetingsOfPeaceTab.value = false
        stepsTab.value = false
        submitAndCheckEmailTab.value = true
    })
}

const submitNewStudentToGmail = async () => {
    await $fetch(endpoint.value + "/api/admissions/submit-new-student-to-gmail/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: newStudentSubmitToEmail.value,
    }).then((response) => {
        // console.log(response);
        // console.log(newStudentSubmitToEmail.value)
    })

}

const submitForm = () => {
    submitFunc()
    submitNewStudentToGmail()
    // console.log(newStudent.value)
    // saveFile();
}
</script>

<template>
<div class="bg-gray-50">
    <Header />
    <div class="">
        <div class="">
            <div class="">
                <div class="pt-10 w-full bg-green-900">
                    <h1 class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto pt-14 pb-5">
                        Admissions
                    </h1>
                </div>
                <div class="pt-2.5 pb-3 shadow-lg">
                    <ul class="flex lasalle-green-text capitalize w-11/12 mx-auto text-xs">
                        <li>
                            <a href="/" class="mr-1"> Home </a>
                        </li>
                        <li>
                            <i class="fas fa-caret-right mr-1"></i>
                            <a href="/enrollment" class="mr-1"> Enrollment </a>
                        </li>
                        <li>
                            <i class="fas fa-caret-right mr-1"></i>
                            <a href="/enrollment" class="mr-1"> Admissions </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <div>
            <div class="w-11/12 mx-auto shadow px-8 lg:py-7 py-2 lg:mt-10 mt-3 lg:mb-3">
                <h1 class="font-bold lg:text-base text-xs text-green-800 text-center">
                    APPLICATION FOR ADMISSION TO LA SALLE UNIVERSITY FOR UNDERGRADUATE STUDENTS
                </h1>
            </div>

            <div v-if="lasallianGreetingsOfPeaceTab">
                <div class="w-11/12 mx-auto">
                    <div class="lg:w-6/12 shadow mx-auto px-8 py-7 lg:my-10 text-center">
                        <p class="text-base mb-4 text-green-900 font-bold">
                            Lasallian Greetings of Peace!
                        </p>
                        <p class="text-xs mb-4">
                            As part of your admission to La Salle University (LSU), the following information must be
                            provided completely by the applicant or parent/legal guardian if minors. Please type N/A for
                            questions that are not applicable to you.
                        </p>
                        <div class="mt-10 w-fit mx-auto">
                            <div class="cursor-pointer py-1 uppercase pr-5 pl-8 shadow bg-green-800 text-white hover:bg-white hover:text-green-800 rounded-lg mx-5 border-2 border-green-800"
                                @click="startFilling()">Proceed <i class="fa fa-angle-double-right ml-5"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="stepsTab">
                <div class="w-11/12 mx-auto items-center flex lg:pt-5 lg:pb-10 justify-center">
                    <div class="mt-3 w-full">
                        <div class="">
                            <ul class="flex justify-between">
                                <li @click="toggleInfo(
                                    true, false, false, false, false, false)" class="w-full ">
                                    <span
                                        class=" text-white  bg-green-900 lg:rounded-lg rounded-full lg:px-3 px-1.5 lg:py-2 pt-0 pb-1 h-10 w-10 text-center">
                                        <i class="lg:text-sm text-xs fa fa-address-book" aria-hidden="true"></i>
                                    </span>
                                    <span class="bg-green-900 h-0.5 w-full block -mt-2.5"></span>
                                    <p
                                        class="text-left lg:text-xs text-[10px] mt-5  text-green-800 lg:whitespace-nowrap lg:flex hidden">
                                        Preliminaries
                                    </p>
                                </li>
                                <li @click="toggleInfo(
                                    false, true, false, false, false, false)" class="w-full ">
                                    <span
                                        class=" text-white  bg-green-900 lg:rounded-lg rounded-full lg:px-3 px-2 lg:py-2 pt-0 pb-1 h-10 w-10 text-center">
                                        <i class="lg:text-sm text-xs fa fa-user" aria-hidden="true"></i>
                                    </span>
                                    <span class="bg-green-900 h-0.5 w-full block -mt-2.5"></span>
                                    <p
                                        class="text-left lg:text-xs text-[10px]  mt-5  text-green-800 lg:whitespace-nowrap lg:flex hidden">
                                        Student Information
                                    </p>
                                </li>
                                <li @click="toggleInfo(
                                    false, false, true, false, false, false)" class="w-full ">
                                    <span
                                        class=" text-white  bg-green-900 lg:rounded-lg rounded-full lg:px-3 px-1.5 lg:py-2 pt-0 pb-1 h-10 w-10 text-center">
                                        <i class="lg:text-sm text-xs fa fa-users" aria-hidden="true"></i>
                                    </span>
                                    <span class="bg-green-900 h-0.5 w-full block -mt-2.5"></span>
                                    <p
                                        class="text-left lg:text-xs text-[10px] mt-5  text-green-800 lg:whitespace-nowrap lg:flex hidden">
                                        Family Information
                                    </p>
                                </li>
                                <li @click="toggleInfo(
                                    false, false, false, true, false, false)" class="w-full ">
                                    <span
                                        class=" text-white  bg-green-900 lg:rounded-lg rounded-full lg:px-3 px-1.5 lg:py-2 pt-0 pb-1 h-10 w-10 text-center">
                                        <i class="lg:text-sm text-xs fa fa-graduation-cap"></i>
                                    </span>
                                    <span class="bg-green-900 h-0.5 w-full block -mt-2.5"></span>
                                    <p
                                        class="text-left lg:text-xs text-[10px] mt-5  text-green-800 lg:whitespace-nowrap lg:flex hidden">
                                        Education
                                    </p>
                                </li>
                                <li @click="toggleInfo(
                                    false, false, false, false, true, false)" class="w-full ">
                                    <span
                                        class=" text-white  bg-green-900 lg:rounded-lg rounded-full lg:px-3 px-2 lg:py-2 pt-0 pb-1 h-10 w-10 text-center">
                                        <i class="lg:text-sm text-xs fa fa-poll-h"></i>
                                    </span>
                                    <span class="bg-green-900 h-0.5 w-full block -mt-2.5"></span>
                                    <p
                                        class="text-left lg:text-xs text-[10px] mt-5  text-green-800 lg:whitespace-nowrap lg:flex hidden">
                                        Survey
                                    </p>
                                </li>
                                <li @click="toggleInfo(
                                    false, false, false, false, false, true)" class="w-full ">
                                    <span
                                        class=" text-white  bg-green-900 lg:rounded-lg rounded-full lg:px-3 px-1.5 lg:py-2 pt-0.5 pb-1 lg:h-10 h-10 w-10 text-center">
                                        <i class='fa fa-certificate'></i>
                                    </span>
                                    <span class="bg-green-900 h-0.5 w-full block -mt-2.5"></span>
                                    <p
                                        class="text-left lg:text-xs text-[10px] mt-5  text-green-800 lg:whitespace-nowrap lg:flex hidden">
                                        Certification
                                    </p>
                                </li>
                                <li class="">
                                    <span
                                        class=" text-white  bg-green-900 lg:rounded-lg rounded-full lg:px-3 px-1.5 lg:py-2 pt-0 pb-1 h-10 w-10 text-center">
                                        <i class="lg:text-sm text-xs fa fa-paper-plane" aria-hidden="true"></i>
                                    </span>
                                    <p
                                        class="text-left lg:text-xs text-[10px] -ml-24  mt-3  text-green-800 lg:whitespace-nowrap lg:flex hidden">
                                        Submit and Check Email
                                    </p>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <form v-on:submit.prevent="submitForm">
                                <div class="border-t-2 border-green-700 my-5 shadow-lg rounded-lg"
                                    v-show="toggle.preliminaries">
                                    <div class="lg:px-5 px-3 lg:py-7 py-4" v-if="preliminariesTab === 'CONTINUING (change program)'
                                        || preliminariesTab === 'CONTINUING'
                                        || preliminariesTab === 'RETURNEE (change program)'
                                        || preliminariesTab === 'RETURNEE'">
                                        <div class="">
                                            <h2 class="uppercase font-bold text-green-900 text-sm mb-3">
                                                {{ newStudent.data_privacy_notice_consent.text[0] }}
                                            </h2>
                                            <p class="text-green-900 leading-tight tracking-tight text-xs mb-2">
                                                {{ newStudent.data_privacy_notice_consent.text[1] }}
                                            </p>
                                            <p class="text-green-900 leading-tight tracking-tight text-xs mb-2">
                                                {{ newStudent.data_privacy_notice_consent.text[2] }}
                                            </p>
                                            <p class="text-green-900 leading-tight tracking-tight text-xs mb-2">
                                                {{ newStudent.data_privacy_notice_consent.text[3] }}
                                            </p>
                                            <p class="text-green-900 leading-tight tracking-tight text-xs mb-2">
                                                {{ newStudent.data_privacy_notice_consent.text[4] }}
                                            </p>
                                        </div>
                                        <div>
                                            <div class="flex items-center my-2">
                                                <input type="checkbox"
                                                    v-model="newStudent.data_privacy_notice_consent.read_above_statements_terms_and_conditions"
                                                    class="mr-2" />
                                                <label
                                                    class="text-xs leading-tight tracking-tight font-bold text-green-900">
                                                    {{ newStudent.data_privacy_notice_consent.text[5] }}
                                                </label>
                                            </div>
                                            <div class="flex items-center">
                                                <input type="checkbox"
                                                    v-model="newStudent.data_privacy_notice_consent.is_eighteen_years_old_or_above"
                                                    class="mr-2" />
                                                <label
                                                    class="text-xs leading-tight tracking-tight font-bold text-green-900">
                                                    {{ newStudent.data_privacy_notice_consent.text[6] }}
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="lg:flex">
                                        <div
                                            class="lg:w-4/12 mx-auto lg:shadow lg:px-10 px-3 lg:py-8 lg:my-0 my-3 mt-2 mb-3">
                                            <div class="lg:py-0 py-2">
                                                <h2 class="font-bold uppercase text-sm text-center"
                                                    v-if="studentClassificationStatus">
                                                    Applying as
                                                </h2>
                                                <div class="lg:flex mx-auto lg:w-full md:w-6/12 w-full lg:gap-10 gap-5"
                                                    v-if="studentClassificationStatus">
                                                    <div @click="preliminariesTabCategoryNew()"
                                                        class="bg-green-800 text-white font-bold w-full border-2 border-green-800 text-center rounded-lg lg:py-2 py-1 my-4 px-3 hover:bg-white hover:text-green-900 lg:whitespace-nowrap">
                                                        New Student
                                                    </div>
                                                    <div @click="preliminariesTabCategoryContinuing()"
                                                        class="bg-green-800 text-white font-bold w-full border-2 border-green-800 text-center rounded-lg lg:py-2 py-1 my-4 px-3 hover:bg-white hover:text-green-900 lg:whitespace-nowrap">
                                                        Continuing Student
                                                    </div>
                                                </div>
                                                <h2 class="font-bold uppercase text-sm text-center"
                                                    v-if="studentNewStatus">
                                                    New Student Status
                                                </h2>
                                                <h2 class="font-bold uppercase text-sm text-center"
                                                    v-if="studentContinuingStatus">
                                                    Continuing Student Status
                                                </h2>
                                                <div v-if="studentClassificationStatusList">
                                                    <div class="rounded-lg border-2  hover:bg-white hover:text-green-700 mb-2 text-center mt-3 lg:w-7/12 w-10/12 mx-auto"
                                                        @click="displayPreliminaries(p)"
                                                        v-for="(p, i) in newStudent.student_classification_status"
                                                        :key="i"
                                                        :class="p === preliminariesTab ? 'bg-green-950 border-green-950 text-xs font-bold px-2 py-1 text-white' : 'bg-green-700 border-green-700 text-white lg:px-5 px-4 py-1 tracking-tighter text-xs'">
                                                        <span>
                                                            {{ p }}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <div class="w-full px-3 text-center"
                                                    v-for="(p, i) in newStudent.preliminaries" :key="i">
                                                    <div v-if="p.category === preliminariesTab" class="">
                                                        <div class="py-2">
                                                            <span class="font-bold text-black block text-xs mb-3">
                                                                {{ p.list.student_classifications }}
                                                            </span>
                                                            <span
                                                                class="text-xs text-green-900 leading-tighter flex lg:w-8/12 mx-auto">
                                                                {{ p.list.descriptions }}
                                                            </span>
                                                        </div>
                                                        <!-- <div class="hidden">
                                                            <div class=" py-2 flex items-center justify-center">
                                                                <span class="text-xs">{{ p.list.follow_up_questions_one
                                                                    }}</span>
                                                            </div>
                                                            <div class=" py-2 flex items-center justify-center">
                                                                <span class="flex gap-5">
                                                                    <span class="flex items-center">
                                                                        <input v-model="p.list.answers_one" value="Yes"
                                                                            type="radio" class="mr-1" />
                                                                        <span class="text-xs text-green-900 mr-2">
                                                                            Yes</span>
                                                                    </span>
                                                                    <span class="flex items-center">
                                                                        <input v-model="p.list.answers_one" value="No"
                                                                            type="radio" class="mr-1" />
                                                                        <span class="text-xs text-green-900 mr-2">
                                                                            No</span>
                                                                    </span>
                                                                </span>
                                                            </div>
                                                        </div> -->
                                                        <div class="">
                                                            <div class="py-2" v-show="p.list.answers_one === 'Yes'">
                                                                <span class="text-xs text-green-900">
                                                                    {{ p.list.follow_up_questions_two }}
                                                                </span>
                                                            </div>

                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="lg:w-8/12 shadow lg:px-8 px-2 py-3 lg:my-0 my-3" v-if="preliminariesTab === 'CONTINUING (change program)'
                                            || preliminariesTab === 'CONTINUING'
                                            || preliminariesTab === 'RETURNEE (change program)'
                                            || preliminariesTab === 'RETURNEE'">
                                            <div class="lg:flex gap-3 lg:w-10/12 mx-auto">
                                                <div class="w-full">
                                                    <ul class="w-full">
                                                        <!-- <li class="w-4/12 lg:pr-5 lg:flex hidden">
                                                            <span class="lg:text-xs text-[10px] text-gray-400 whitespace-nowrap w-full">
                                                                Full Name
                                                            </span>
                                                        </li> -->
                                                        <li class="">
                                                            <div class="w-full lg:mb-3 mb-2">
                                                                <span
                                                                    class="text-right lg:text-xs text-[10px] text-gray-400">
                                                                    Last Name
                                                                </span>
                                                                <span class="w-full">
                                                                    <input
                                                                        v-model="newStudent.student_personal_info.lastname"
                                                                        class="w-full text-xs px-3 py-1 capitalize border-b-2 border-t-0 border-x-0 
                                                                    border-green-700 shadow-lg rounded-sm font-bold"
                                                                        placeholder="Last Name" />
                                                                </span>
                                                            </div>
                                                            <div class="w-full lg:mb-3 mb-2">
                                                                <span
                                                                    class="text-right lg:text-xs text-[10px] text-gray-400">
                                                                    First Name
                                                                </span>
                                                                <span class="w-full">
                                                                    <input
                                                                        v-model="newStudent.student_personal_info.firstname"
                                                                        class="w-full text-xs px-3 py-1 capitalize border-b-2 border-t-0 border-x-0 
                                                                    border-green-700 shadow-lg rounded-sm font-bold"
                                                                        placeholder="First Name" />
                                                                </span>
                                                            </div>
                                                            <div class="w-full lg:mb-3 mb-2">
                                                                <span
                                                                    class="text-right lg:text-xs text-[10px] text-gray-400">
                                                                    Middle Name
                                                                </span>
                                                                <span class="w-full">
                                                                    <input
                                                                        v-model="newStudent.student_personal_info.middlename"
                                                                        class="w-full text-xs px-3 py-1 capitalize border-b-2 border-t-0 border-x-0 
                                                                    border-green-700 shadow-lg rounded-sm font-bold"
                                                                        placeholder="Middle Name" />
                                                                </span>
                                                            </div>

                                                            <div class="w-full lg:mb-3 mb-2">
                                                                <span
                                                                    class="text-right lg:text-xs text-[10px] text-gray-400">
                                                                    Suffix Name
                                                                </span>
                                                                <span class="w-full">
                                                                    <input
                                                                        v-model="newStudent.student_personal_info.extension_or_suffix_name"
                                                                        class="w-full text-xs px-3 py-1 capitalize border-b-2 border-t-0 border-x-0 
                                                                    border-green-700 shadow-lg rounded-sm"
                                                                        placeholder="Suffix Name" />
                                                                </span>
                                                            </div>
                                                        </li>
                                                    </ul>
                                                    <ul class="w-full lg:mb-5 gap-3">
                                                        <li class="block lg:mb-3 mb-1">
                                                            <span
                                                                class="w-4/12 text-right pr-5 lg:text-xs text-[10px] text-gray-400">
                                                                Birth Sex
                                                            </span>
                                                            <div class="flex lg:w-fit gap-10 border-b-2 
                                                                    border-green-700 shadow-lg rounded-sm pl-3 pr-5 py-1">
                                                                <div class="flex w-full">
                                                                    <input type="radio" value="Female"
                                                                        v-model="newStudent.student_personal_info.birth_sex"
                                                                        class="mr-2" />
                                                                    <label class="text-[10px] ">
                                                                        Female
                                                                    </label>
                                                                </div>
                                                                <div class="flex">
                                                                    <input type="radio" value="Male"
                                                                        v-model="newStudent.student_personal_info.birth_sex"
                                                                        class="mr-2" />
                                                                    <label class="text-[10px] ">
                                                                        Male
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </li>
                                                        <!-- <li class="lg:mb-3 mb-1">
                                                            <span
                                                                class="w-4/12 text-right pr-5 lg:text-xs text-[10px] text-gray-400">
                                                                Contact Email Address
                                                            </span>
                                                            <span class="lg:w-7/12 w-8/12">
                                                                <input
                                                                    type="email"
                                                                    v-model="newStudent.student_contact_info.contact.personal_email_address"
                                                                    class="w-full text-xs px-3 py-1 border-b-2 border-t-0 border-x-0 
                                                                border-green-700 shadow-lg rounded-sm font-bold"
                                                                    placeholder="Contact Email Address" />
                                                            </span>
                                                        </li> -->
                                                        <li class="lg:mb-3 mb-1">
                                                            <span
                                                                class="w-4/12 text-right pr-5 lg:text-xs text-[10px] text-gray-400">
                                                                LSU Email
                                                            </span>
                                                            <span class="lg:w-7/12 w-8/12">
                                                                <input type="email"
                                                                    v-model="newStudent.student_contact_info.contact.lsu_email_address"
                                                                    class="w-full text-xs px-3 py-1 border-b-2 border-t-0 border-x-0 
                                                                border-green-700 shadow-lg rounded-sm font-bold"
                                                                    placeholder="Contact Email Address" />
                                                            </span>
                                                        </li>
                                                        <li class="lg:mb-3 mb-1">
                                                            <span
                                                                class="w-4/12 text-right pr-5 lg:text-xs text-[10px] text-gray-400">
                                                                Contact Number
                                                            </span>
                                                            <span class="lg:w-7/12 w-8/12">
                                                                <input
                                                                    v-model="newStudent.student_contact_info.contact.primary_number"
                                                                    class="w-full text-xs px-3 py-1 capitalize border-b-2 border-t-0 border-x-0 
                                                                border-green-700 shadow-lg rounded-sm font-bold"
                                                                    placeholder="Contact Number" />
                                                            </span>
                                                        </li>
                                                        <li class="lg:mb-3 mb-1" v-if="preliminariesTab === 'CONTINUING' ||
                                                            preliminariesTab === 'RETURNEE' ||
                                                            preliminariesTab === 'CONTINUING (change program)' ||
                                                            preliminariesTab === 'RETURNEE (change program)'
                                                        ">
                                                            <span
                                                                class="w-4/12 text-right pr-5 lg:text-xs text-[10px] text-gray-400">
                                                                LSU Student ID Number
                                                            </span>
                                                            <span class="lg:w-7/12 w-8/12">
                                                                <input v-model="newStudent.student_lsu_id_number" class="w-full text-xs px-3 py-1 capitalize border-b-2 border-t-0 border-x-0 
                                                                border-green-700 shadow-lg rounded-sm font-bold"
                                                                    placeholder="LSU Student ID Number" />
                                                            </span>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <div class="w-full">
                                                    <ul class="lg:mb-5 gap-3">
                                                        <li class="lg:mb-3 lg:w-[200px]"
                                                            v-if="preliminariesTab === 'NEW FRESHMAN'">
                                                            <span
                                                                class="w-4/12 text-right pr-5 lg:text-xs text-[10px] capitalize text-gray-400">
                                                                senior high school track
                                                            </span>
                                                            <span class="lg:w-7/12 w-8/12">
                                                                <input
                                                                    v-model="newStudent.admissions_list_filter.senior_high_school_track"
                                                                    class="w-full text-xs px-3 py-1 capitalize border-b-2 border-t-0 border-x-0 
                                                                border-green-700 shadow-lg rounded-sm font-bold"
                                                                    placeholder="senior high school track" />
                                                            </span>
                                                        </li>
                                                        <li class="lg:mb-3 mb-2 lg:w-[400px]" v-if="preliminariesTab === 'NEW FRESHMAN' ||
                                                            preliminariesTab === 'TRANSFEREE' ||
                                                            preliminariesTab === 'CONTINUING (change program)' ||
                                                            preliminariesTab === 'RETURNEE (change program)'
                                                        ">
                                                            <span
                                                                class="w-4/12 text-right pr-5 lg:text-xs text-[10px] text-gray-400">
                                                                Program to Applied
                                                            </span>
                                                            <span class="lg:w-7/12 w-8/12">
                                                                <input
                                                                    v-model="newStudent.admissions_list_filter.program_applied"
                                                                    class="w-full text-xs px-3 py-1 border-b-2 border-t-0 border-x-0 
                                                                border-green-700 shadow-lg rounded-sm font-bold"
                                                                    placeholder="program to applied" />
                                                            </span>
                                                        </li>
                                                        <li class="lg:mb-3 mb-2 lg:w-[400px]">
                                                            <span
                                                                class="w-4/12 text-right pr-5 lg:text-xs text-[10px] text-gray-400 capitalize">
                                                                college
                                                            </span>
                                                            <span class="lg:w-7/12 w-8/12">
                                                                <input
                                                                    v-model="newStudent.admissions_list_filter.college"
                                                                    class="w-full text-xs px-3 py-1 capitalize border-b-2 border-t-0 border-x-0 
                                                                border-green-700 shadow-lg rounded-sm font-bold"
                                                                    placeholder="college" />
                                                            </span>
                                                        </li>
                                                        <li class="lg:mb-3 mb-2" v-if="preliminariesTab === 'NEW FRESHMAN' ||
                                                            preliminariesTab === 'TRANSFEREE'">
                                                            <span
                                                                class="w-4/12 text-right pr-5 lg:text-xs text-[10px] capitalize text-gray-400">
                                                                name of previous school
                                                            </span>
                                                            <span class="lg:w-7/12 w-8/12">
                                                                <input
                                                                    v-model="newStudent.admissions_list_filter.name_of_previous_school"
                                                                    class="w-full text-xs px-3 py-1 capitalize border-b-2 border-t-0 border-x-0 
                                                                border-green-700 shadow-lg rounded-sm font-bold"
                                                                    placeholder="name of previous school" />
                                                            </span>
                                                        </li>
                                                        <li class="lg:mb-3 mb-2 lg:w-[100px]">
                                                            <span
                                                                class="w-4/12 text-right pr-5 lg:text-xs text-[10px] text-gray-400 capitalize">
                                                                new term
                                                            </span>
                                                            <span class="lg:w-7/12 w-8/12">
                                                                <input
                                                                    v-model="newStudent.admissions_list_filter.new_term"
                                                                    class="w-full text-xs px-3 py-1 capitalize border-b-2 border-t-0 border-x-0 
                                                                border-green-700 shadow-lg rounded-sm font-bold"
                                                                    placeholder="new term" disabled />
                                                            </span>
                                                        </li>
                                                        <li class="lg:mb-3 mb-2 lg:w-[120px]">
                                                            <span
                                                                class="w-4/12 text-right pr-5 lg:text-xs text-[10px] capitalize text-gray-400 ">
                                                                new academic year
                                                            </span>
                                                            <span class="lg:w-7/12 w-8/12">
                                                                <input
                                                                    v-model="newStudent.admissions_list_filter.new_academic_year"
                                                                    class="w-full text-xs px-3 py-1 capitalize border-b-2 border-t-0 border-x-0 
                                                                border-green-700 shadow-lg rounded-sm font-bold"
                                                                    placeholder="new academic year" disabled />
                                                            </span>
                                                        </li>

                                                        <li class="lg:mb-3 mb-2 lg:w-[400px]" v-if="
                                                            preliminariesTab === 'TRANSFEREE' ||
                                                            preliminariesTab === 'CONTINUING (change program)' ||
                                                            preliminariesTab === 'RETURNEE (change program)'
                                                        ">
                                                            <span
                                                                class="w-4/12 text-right pr-5 lg:text-xs text-[10px] capitalize text-gray-400">
                                                                previous program enrolled
                                                            </span>
                                                            <span class="lg:w-7/12 w-8/12">
                                                                <input
                                                                    v-model="newStudent.admissions_list_filter.previous_program_enrolled"
                                                                    class="w-full text-xs px-3 py-1 capitalize border-b-2 border-t-0 border-x-0 
                                                                border-green-700 shadow-lg rounded-sm"
                                                                    placeholder="previous program enrolled" />
                                                            </span>
                                                        </li>

                                                        <li class="lg:mb-3 mb-2" v-if="preliminariesTab === 'CONTINUING' ||
                                                            preliminariesTab === 'RETURNEE'
                                                        ">
                                                            <span
                                                                class="w-4/12 text-right pr-5 lg:text-xs text-[10px] capitalize">
                                                                program
                                                            </span>
                                                            <span class="lg:w-7/12 w-8/12">
                                                                <input
                                                                    v-model="newStudent.admissions_list_filter.program"
                                                                    class="w-full text-xs px-3 py-1 capitalize border-b-2 border-t-0 border-x-0 
                                                                border-green-700 shadow-lg rounded-sm font-bold"
                                                                    placeholder="program" />
                                                            </span>
                                                        </li>

                                                        <li class="lg:flex lg:mb-0 mb-2 gap-3" v-if="preliminariesTab === 'CONTINUING (change program)'
                                                            || preliminariesTab === 'RETURNEE (change program)'
                                                            || preliminariesTab === 'RETURNEE'">
                                                            <div class="lg:w-[170px] lg:mb-3 mb-2">
                                                                <label
                                                                    class="text-right pr-5 lg:text-xs text-[10px] capitalize text-gray-400">
                                                                    Last Term
                                                                </label>
                                                                <select
                                                                    v-model="newStudent.admissions_list_filter.last_term_enrolled"
                                                                    class="w-full text-xs px-3 py-1 capitalize border-b-2 border-t-0 border-x-0 font-bold 
                                                                    border-green-700 shadow-lg rounded-sm">
                                                                    <option class="text-xs text-green-900 py-2"
                                                                        value="Select Term"
                                                                        disabled>
                                                                        Select Term
                                                                    </option>
                                                                    <option class="text-xs text-green-900 py-2"
                                                                        value="1st Semester">1st
                                                                        Semester</option>
                                                                    <option class="text-xs text-green-900 py-2"
                                                                        value="2nd Semester">2nd
                                                                        Semester</option>
                                                                    <option class="text-xs text-green-900 py-2"
                                                                        value="Summer">
                                                                        Summer
                                                                    </option>
                                                                </select>
                                                            </div>
                                                            <div class="lg:w-[170px]">
                                                                <label
                                                                    class="text-right pr-5 lg:text-xs text-[10px] capitalize text-gray-400">
                                                                    Last Academic Year
                                                                </label>
                                                                <select
                                                                    v-model="newStudent.admissions_list_filter.last_academic_year_enrolled"
                                                                    class="w-full text-xs px-3 py-1 capitalize border-b-2 border-t-0 border-x-0 font-bold
                                                                border-green-700 shadow-lg rounded-sm">
                                                                    <option class="text-xs text-green-900 py-2" 
                                                                        value="Select Academic Year"
                                                                        disabled>Select Academic Year
                                                                    </option>
                                                                    <option class="text-xs text-green-900 py-2" value="A.Y.
                                                                        2010 - 2011">
                                                                        A.Y.
                                                                        2010 - 2011
                                                                    </option>
                                                                    <option class="text-xs text-green-900 py-2" value="A.Y.
                                                                        2011 - 2012">
                                                                        A.Y.
                                                                        2011 - 2012
                                                                    </option>
                                                                    <option class="text-xs text-green-900 py-2" value="A.Y.
                                                                        2012 - 2013">
                                                                        A.Y.
                                                                        2012 - 2013
                                                                    </option>
                                                                    <option class="text-xs text-green-900 py-2" value="A.Y.
                                                                        2013 - 2014">
                                                                        A.Y.
                                                                        2013 - 2014
                                                                    </option>
                                                                    <option class="text-xs text-green-900 py-2" value="A.Y.
                                                                        2014 - 2015">
                                                                        A.Y.
                                                                        2014 - 2015
                                                                    </option>
                                                                    <option class="text-xs text-green-900 py-2" value="A.Y.
                                                                        2015 - 2016">
                                                                        A.Y.
                                                                        2015 - 2016
                                                                    </option>
                                                                    <option class="text-xs text-green-900 py-2" value="A.Y.
                                                                        2016 - 2017">
                                                                        A.Y.
                                                                        2016 - 2017
                                                                    </option>
                                                                    <option class="text-xs text-green-900 py-2" value="A.Y.
                                                                        2017 - 2018">
                                                                        A.Y.
                                                                        2017 - 2018
                                                                    </option>
                                                                    <option class="text-xs text-green-900 py-2" value="A.Y.
                                                                        2018 - 2019">
                                                                        A.Y.
                                                                        2018 - 2019
                                                                    </option>
                                                                    <option class="text-xs text-green-900 py-2" value="A.Y.
                                                                        2019 - 2020">
                                                                        A.Y.
                                                                        2019 - 2020
                                                                    </option>
                                                                    <option class="text-xs text-green-900 py-2" value="A.Y.
                                                                        2020 - 2021">
                                                                        A.Y.
                                                                        2020 - 2021
                                                                    </option>
                                                                    <option class="text-xs text-green-900 py-2" value="A.Y.
                                                                        2021 - 2022">
                                                                        A.Y.
                                                                        2021 - 2022
                                                                    </option>
                                                                    <option class="text-xs text-green-900 py-2" value="A.Y.
                                                                        2022 - 2023">
                                                                        A.Y.
                                                                        2022 - 2023
                                                                    </option>
                                                                    <option class="text-xs text-green-900 py-2" value="A.Y.
                                                                        2023 - 2024">
                                                                        A.Y.
                                                                        2023 - 2024
                                                                    </option>
                                                                </select>
                                                            </div>
                                                        </li>
                                                        <li class="lg:mb-3 mb-2 w-[100px]" v-if="
                                                            preliminariesTab === 'CONTINUING (change program)' ||
                                                            preliminariesTab === 'RETURNEE (change program)'
                                                        ">
                                                            <span
                                                                class="w-4/12 text-right pr-5 lg:text-xs text-[10px] capitalize text-gray-400">
                                                                total units earned
                                                            </span>
                                                            <span class="lg:w-7/12 w-8/12">
                                                                <input
                                                                    v-model="newStudent.admissions_list_filter.total_units_earned"
                                                                    class="w-full text-xs px-3 py-1 capitalize border-b-2 border-t-0 border-x-0 
                                                                border-green-700 shadow-lg rounded-sm font-bold"
                                                                    placeholder="total units earned" />
                                                            </span>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="lg:w-8/12 shadow flex items-center"
                                            v-if="preliminariesTab === 'NEW FRESHMAN' || preliminariesTab === 'TRANSFEREE'">
                                            <div class="lg:w-8/12 mx-auto lg:p-10 p-5">
                                                <p class="font-bold uppercase text-green-800 lg:text-sm text-xs mb-3">
                                                    OPENING OF CLASSES FOR FIRST SEMESTER OF ACADEMIC YEAR 2024-2025</p>

                                                <p class="text-green-800 text-xs">Thank you for your interest in joining
                                                    the Lasallian community.
                                                    You should be able to begin your application in the university on
                                                    July 1, 2024. </p>

                                                <p class="text-green-800 mb-4 text-xs">To stay informed and learn more
                                                    about applying for admission:</p>

                                                <ul class="text-green-800 list-disc ml-10 text-xs">
                                                    <li class="hover:font-bold">

                                                        <a href="https://www.lsu.edu.ph">lsu.edu.ph </a>
                                                    </li>
                                                    <li class="hover:font-bold">
                                                        <a href="https://www.facebook.com/lsu.edu.ph/">LSU Facebook
                                                            Page</a>
                                                    </li>
                                                    <li class="">Admission Requirements</li>
                                                </ul>

                                            </div>




                                        </div>
                                    </div>
                                    <div class="py-5" v-if="preliminariesTab === 'CONTINUING (change program)'
                                        || preliminariesTab === 'CONTINUING'
                                        || preliminariesTab === 'RETURNEE (change program)'
                                        || preliminariesTab === 'RETURNEE'">
                                        <div class="w-fit mr-0 ml-auto flex">
                                            <div class="cursor-pointer py-1 uppercase px-4 shadow bg-green-800 text-white hover:bg-white hover:text-green-800 rounded-lg mx-2"
                                                @click="toggleInfo(
                                                    false, true, false, false, false, false)">Next <i
                                                    class="fa fa-angle-double-right pl-2"></i></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="border-t-2 border-green-700 mt-5 shadow-lg rounded-lg"
                                    v-show="toggle.studentInfo">
                                    <div>
                                        <div class="border-b-4 lg:px-10 px-3 py-5">
                                            <p class="text-green-800 uppercase font-bold mb-3">Personal Details</p>
                                            <div class="">
                                                <div>
                                                    <div class="lg:flex gap-3">
                                                        <div class="lg:block hidden">
                                                            <label
                                                                class="text-[10px] text-gray-300 lg:block hidden">Title</label>
                                                            <div>
                                                                <input type="text" class="lg:w-20 w-full capitalize border-b-2 border-t-0 border-x-0 border-green-700 
                                                                    shadow-lg rounded-sm h-9 text-xs"
                                                                    v-model="newStudent.student_personal_info.title"
                                                                    placeholder="title" />
                                                            </div>
                                                        </div>
                                                        <div class="mb-3 w-full">
                                                            <div class="lg:flex w-full gap-3">

                                                                <div class="flex gap-3 w-full lg:mb-0 mb-3">
                                                                    <div class="w-full">
                                                                        <label
                                                                            class="text-[10px] text-gray-300 lg:block hidden">Last
                                                                            Name</label>
                                                                        <input type="text" class="w-full capitalize border-b-2 border-t-0 border-x-0 border-green-700 
                                                                            shadow-lg rounded-sm h-9 text-xs"
                                                                            placeholder="Last Name"
                                                                            v-model="newStudent.student_personal_info.lastname" />
                                                                    </div>
                                                                    <div class="w-full">
                                                                        <label
                                                                            class="text-[10px] text-gray-300 lg:block hidden">First
                                                                            Name</label>
                                                                        <input type="text" class="w-full capitalize border-b-2 border-t-0 border-x-0 border-green-700 
                                                                            shadow-lg rounded-sm h-9 text-xs"
                                                                            placeholder="First Name"
                                                                            v-model="newStudent.student_personal_info.firstname" />
                                                                    </div>

                                                                </div>
                                                                <div class="lg:w-8/12 w-full lg:mb-0 mb-3">
                                                                    <label
                                                                        class="text-[10px] text-gray-300 lg:block hidden">Middle
                                                                        Name</label>
                                                                    <div class="flex gap-3">

                                                                        <div class="flex">
                                                                            <span class="block">
                                                                                <span
                                                                                    class="flex items-center mr-3 mb-1">
                                                                                    <input type="radio" value="yes"
                                                                                        v-model="newStudent.student_personal_info.has_middlename" />
                                                                                    <label
                                                                                        class=" text-xs ml-2 capitalize">yes</label>
                                                                                </span>
                                                                                <span class="flex items-center mr-3">
                                                                                    <input type="radio" value="no"
                                                                                        v-model="newStudent.student_personal_info.has_middlename" />
                                                                                    <label
                                                                                        class=" text-xs ml-2 capitalize">no</label>
                                                                                </span>
                                                                            </span>
                                                                        </div>
                                                                        <div class="w-full">
                                                                            <input
                                                                                :class="newStudent.student_personal_info.has_middlename === 'yes' ? '' : 'hidden'"
                                                                                type="text" class="w-full capitalize border-b-2 border-t-0 border-x-0 border-green-700 
                                                                            shadow-lg rounded-sm h-9 text-xs"
                                                                                placeholder="Middle Name"
                                                                                v-model="newStudent.student_personal_info.middlename" />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="flex gap-3">


                                                                    <div class="lg:hidden flex">
                                                                        <label
                                                                            class="text-[10px] text-gray-300 lg:block hidden">Title</label>
                                                                        <div>
                                                                            <input type="text" class="lg:w-20 w-full capitalize border-b-2 border-t-0 border-x-0 border-green-700 
                                                                    shadow-lg rounded-sm h-9 text-xs"
                                                                                v-model="newStudent.student_personal_info.title"
                                                                                placeholder="title" />
                                                                        </div>
                                                                    </div>

                                                                    <div>
                                                                        <label
                                                                            class="text-[10px] text-gray-300 lg:block hidden">Suffix</label>
                                                                        <div class="flex">
                                                                            <input type="text" class="lg:w-20 w-full capitalize border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg 
                                                                    rounded-sm h-9 text-xs"
                                                                                v-model="newStudent.student_personal_info.extension_or_suffix_name"
                                                                                placeholder="Suffix" />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                                <div class="lg:flex grid grid-cols-2 gap-3">
                                                    <div class="">
                                                        <label class="text-[10px] text-gray-300 lg:block hidden">Birth
                                                            Sex</label>
                                                       

                                                        <div class="flex lg:w-fit gap-5 pt-2.5 pb-2 pl-4 pr-5 shadow bg-white border-b-2 border-green-700">
                                                                <div class="flex w-full">
                                                                    <input type="radio" value="Female"
                                                                        v-model="newStudent.student_personal_info.birth_sex"
                                                                        class="mr-2" />
                                                                    <label class="text-[10px] ">
                                                                        Female
                                                                    </label>
                                                                </div>
                                                                <div class="flex">
                                                                    <input type="radio" value="Male"
                                                                        v-model="newStudent.student_personal_info.birth_sex"
                                                                        class="mr-2" />
                                                                    <label class="text-[10px] ">
                                                                        Male
                                                                    </label>
                                                                </div>
                                                            </div>


                                                    </div>
                                                    <div>
                                                        <label class="text-[10px] text-gray-300 lg:block hidden">Birth
                                                            Date</label>
                                                        <div>
                                                            <input type="date" class="lg:w-44 px-3 border-b-2 border-t-0 border-x-0 
                                                                border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                placeholder="Date of Birth"
                                                                v-model="newStudent.student_personal_info.birth_date" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label
                                                            class="text-[10px] text-gray-300 lg:block hidden">Age</label>
                                                        <div>
                                                            <select class="lg:w-24 w-full px-3 capitalize border-b-2 border-t-0 border-x-0
                                                                 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                v-model="newStudent.student_personal_info.age">
                                                                <option value="" disabled selected hidden>Age</option>
                                                                <option :value="j" v-for="(j, i) in ageRange" :key="i">
                                                                    {{ j }}
                                                                </option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label class="text-[10px] text-gray-300 lg:block hidden">
                                                            Birth Order
                                                        </label>
                                                        <div>
                                                            <select
                                                                class="lg:w-fit w-full px-3 capitalize border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                v-model="newStudent.student_personal_info.birth_order">
                                                                <option value="" disabled selected hidden>Birth Order
                                                                </option>
                                                                <option :value="j" v-for="(j, i) in birthOrderList"
                                                                    :key="i">{{
                                                                        j }}
                                                                </option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div class="w-full">
                                                        <label class="text-[10px] text-gray-300 lg:block hidden">Birth
                                                            Place</label>
                                                        <div>
                                                            <input type="text"
                                                                class="w-full px-3 capitalize border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                v-model="newStudent.student_personal_info.birth_place"
                                                                placeholder="Birth Place" />
                                                        </div>
                                                    </div>
                                                    <div class="mb-3 w-full">
                                                        <label
                                                            class="text-[10px] text-gray-300 lg:block hidden">Religion</label>
                                                        <div>
                                                            <input type="text"
                                                                class="w-full px-3 capitalize border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                v-model="newStudent.student_personal_info.religion"
                                                                placeholder="Religion" />
                                                        </div>
                                                    </div>

                                                </div>
                                                <div class="lg:flex lg:gap-10">
                                                    <div class="lg:flex gap-3 grid grid-cols-2">
                                                        <div>
                                                            <label
                                                                class="text-[10px] text-gray-300 lg:block hidden">Citizenship</label>
                                                            <div>
                                                                <input type="text"
                                                                    class="lg:w-32 w-full px-3 capitalize border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                    v-model="newStudent.student_personal_info.citizenship"
                                                                    placeholder="Citizenship" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label
                                                                class="text-[10px] text-gray-300 lg:block hidden">Civil
                                                                Status</label>
                                                            <div>
                                                                <select
                                                                    class="lg:w-44 w-full px-3 capitalize border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                    v-model="newStudent.student_personal_info.civil_status">
                                                                    <option value="" disabled selected hidden>Civil
                                                                        Status
                                                                    </option>
                                                                    <option :value="j" v-for="(j, i) in civilStatusList"
                                                                        :key="i">{{
                                                                            j
                                                                        }}
                                                                    </option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label
                                                                class="text-[10px] text-gray-300 lg:block hidden">Languages
                                                                Spoken</label>
                                                            <div>
                                                                <input type="text"
                                                                    class="lg:w-44 w-full px-3 capitalize border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                    v-model="newStudent.student_personal_info.nationality"
                                                                    placeholder="Languages Spoken" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label
                                                                class="text-[10px] text-gray-300 lg:block hidden">Ethnicity</label>
                                                            <div>
                                                                <input type="text"
                                                                    class="lg:w-44 w-full px-3 capitalize border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                    v-model="newStudent.student_personal_info.ethnicity"
                                                                    placeholder="Ethnicity" />
                                                            </div>
                                                        </div>

                                                    </div>
                                                    <div class="lg:flex items-center pt-3">
                                                        <p class="text-xs lg:mb-0 mb-3 lg:mr-5 text-green-900">Do you
                                                            belong to a
                                                            Tribal/Indigenous Community?</p>
                                                        <div class="flex items-center">
                                                            <span class="flex items-center">
                                                                <input type="radio" value="yes"
                                                                    v-model="newStudent.student_tribal_or_indigenous_community.option" />
                                                                <label class="text-xs px-1">
                                                                    Yes
                                                                </label>
                                                                <span class="flex items-center whitespace-nowrap"
                                                                    :class="newStudent.student_tribal_or_indigenous_community.option === 'yes' ? '' : 'hidden'">
                                                                    <input type="text"
                                                                        v-model="newStudent.student_tribal_or_indigenous_community.name"
                                                                        placeholder="Name of Tribe"
                                                                        class="w-fit px-3 mx-2 capitalize border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs" />
                                                                </span>
                                                            </span>
                                                            <span class="flex items-center mx-1">
                                                                <input type="radio" value="no"
                                                                    v-model="newStudent.student_tribal_or_indigenous_community.option" />
                                                                <label class="text-xs px-1">
                                                                    No
                                                                </label>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="border-b-4 lg:px-10 px-3 py-5">
                                            <p class="text-green-800 uppercase font-bold mb-3">
                                                Contact Information
                                            </p>
                                            <div class="">
                                                <div class="gap-3 mb-1">
                                                    <div class="lg:flex gap-3">
                                                        <div class="w-full lg:mb-0 mb-3">
                                                            <label class="text-[10px] text-gray-300 lg:block hidden">
                                                                Street or Purok
                                                            </label>
                                                            <input type="text"
                                                                class="w-full px-3 capitalize border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                v-model="newStudent.student_contact_info.permanent_living_home_address_category.street_or_purok"
                                                                placeholder="Street or Purok" />
                                                        </div>
                                                        <div class="w-full lg:mb-0 mb-3">
                                                            <label class="text-[10px] text-gray-300 lg:block hidden">
                                                                Barangay or Village
                                                            </label>
                                                            <input type="text"
                                                                class="w-full px-3 capitalize border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                v-model="newStudent.student_contact_info.permanent_living_home_address_category.barangay_or_village"
                                                                placeholder="Barangay or Village" />
                                                        </div>
                                                        <div class="w-full lg:mb-0 mb-3">
                                                            <label class="text-[10px] text-gray-300 lg:block hidden">
                                                                City or Municipality
                                                            </label>
                                                            <input type="text"
                                                                class="w-full px-3 capitalize border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                v-model="newStudent.student_contact_info.permanent_living_home_address_category.city_or_municipality"
                                                                placeholder="City or Municipality" />
                                                        </div>
                                                        <div class="w-full lg:mb-0 mb-3">
                                                            <label class="text-[10px] text-gray-300 lg:block hidden">
                                                                Zip Code
                                                            </label>
                                                            <input type="text"
                                                                class="w-full px-3 capitalize border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                v-model="newStudent.student_contact_info.permanent_living_home_address_category.zipcode"
                                                                placeholder="Zip Code" />
                                                        </div>
                                                        <div class="w-full lg:mb-0 mb-3">
                                                            <label class="text-[10px] text-gray-300 lg:block hidden">
                                                                Province or State
                                                            </label>
                                                            <input type="text"
                                                                class="w-full px-3 capitalize border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                v-model="newStudent.student_contact_info.permanent_living_home_address_category.province_or_state"
                                                                placeholder="Province or State" />
                                                        </div>
                                                        <div class="w-full lg:mb-0 mb-3">
                                                            <label class="text-[10px] text-gray-300 lg:block hidden">
                                                                Region
                                                            </label>
                                                            <input type="text"
                                                                class="w-full px-3 capitalize border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                v-model="newStudent.student_contact_info.permanent_living_home_address_category.region"
                                                                placeholder="Region" />
                                                        </div>

                                                        <div class="w-full lg:mb-0 mb-3">
                                                            <label class="text-[10px] text-gray-300 lg:block hidden">
                                                                County
                                                            </label>
                                                            <input type="text"
                                                                class="w-full px-3 capitalize border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                v-model="newStudent.student_contact_info.permanent_living_home_address_category.country"
                                                                placeholder="County" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="mb-3 lg:flex items-center lg:pt-3">
                                                    <p
                                                        class="text-xs text-green-900 mr-3 lg:pt-1 lg:text-left text-center">
                                                        {{ newStudent.student_contact_info.the_same_address.question }}
                                                    </p>


                                                    <div
                                                        class="flex gap-3 pt-1 lg:mx-0 mx-auto w-fit lg:mb-0 mb-4 lg:mt-0 mt-2">
                                                        <div @click="theSameAddressBtn('yesStudentContactInfo')"
                                                            class="text-xs capitalize cursor-pointer px-3 rounded-lg hover:text-green-800 hover:bg-white border-2 border-green-800"
                                                            :class="newStudent.student_contact_info.the_same_address.answer === 'yes' ? 'text-white bg-green-800' : 'text-green-800 bg-white border-2'">
                                                            yes</div>


                                                        <div @click="theSameAddressBtn('noStudentContactInfo')"
                                                            class="text-xs capitalize cursor-pointer  px-3 rounded-lg hover:text-red-800 hover:bg-white border-2 border-red-800"
                                                            :class="newStudent.student_contact_info.the_same_address.answer === 'no' ? 'text-white bg-red-800' : 'text-red-800 bg-white border-2'">
                                                            no</div>
                                                    </div>

                                                </div>
                                                <div class="gap-3 mb-3"
                                                    :class="newStudent.student_contact_info.the_same_address.answer === 'yes' ? 'hidden' : ''">
                                                    <div class="lg:flex gap-3">
                                                        <div class="w-full lg:mb-0 mb-3">
                                                            <label class="text-[10px] text-gray-300 lg:block hidden">
                                                                Street or Purok
                                                            </label>
                                                            <input type="text"
                                                                class="w-full px-3 capitalize border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                v-model="newStudent.student_contact_info.current_or_present_living_home_address_category.street_or_purok"
                                                                placeholder="Street or Purok" />
                                                        </div>
                                                        <div class="w-full lg:mb-0 mb-3">
                                                            <label class="text-[10px] text-gray-300 lg:block hidden">
                                                                Barangay or Village
                                                            </label>
                                                            <input type="text"
                                                                class="w-full px-3 capitalize border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                v-model="newStudent.student_contact_info.current_or_present_living_home_address_category.barangay_or_village"
                                                                placeholder="Barangay or Village" />
                                                        </div>
                                                        <div class="w-full lg:mb-0 mb-3">
                                                            <label class="text-[10px] text-gray-300 lg:block hidden">
                                                                City or Municipality
                                                            </label>
                                                            <input type="text"
                                                                class="w-full px-3 capitalize border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                v-model="newStudent.student_contact_info.current_or_present_living_home_address_category.city_or_municipality"
                                                                placeholder="City or Municipality" />
                                                        </div>
                                                        <div class="w-full lg:mb-0 mb-3">
                                                            <label class="text-[10px] text-gray-300 lg:block hidden">
                                                                Zip Code
                                                            </label>
                                                            <input type="text"
                                                                class="w-full px-3 capitalize border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                v-model="newStudent.student_contact_info.current_or_present_living_home_address_category.zipcode"
                                                                placeholder="Zip Code" />
                                                        </div>
                                                        <div class="w-full lg:mb-0 mb-3">
                                                            <label class="text-[10px] text-gray-300 lg:block hidden">
                                                                Province or State
                                                            </label>
                                                            <input type="text"
                                                                class="w-full px-3 capitalize border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                v-model="newStudent.student_contact_info.current_or_present_living_home_address_category.province_or_state"
                                                                placeholder="Province or State" />
                                                        </div>
                                                        <div class="w-full lg:mb-0 mb-3">
                                                            <label class="text-[10px] text-gray-300 lg:block hidden">
                                                                Region
                                                            </label>
                                                            <input type="text"
                                                                class="w-full px-3 capitalize border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                v-model="newStudent.student_contact_info.current_or_present_living_home_address_category.region"
                                                                placeholder="Region" />
                                                        </div>
                                                        <div class="w-full lg:mb-0 mb-3">
                                                            <label class="text-[10px] text-gray-300 lg:block hidden">
                                                                County
                                                            </label>
                                                            <input type="text"
                                                                class="w-full px-3 capitalize border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                v-model="newStudent.student_contact_info.current_or_present_living_home_address_category.country"
                                                                placeholder="County" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="lg:flex gap-3 mb-4">
                                                    <div class="flex w-full gap-3">
                                                        <div class="w-full lg:mb-0 mb-3">
                                                            <label class="text-[10px] text-gray-300 lg:block hidden">
                                                                Primary Contact Number</label>
                                                            <div>
                                                                <input type="text"
                                                                    class="w-full text-xs px-3 capitalize border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9"
                                                                    placeholder="(+63) XXX-XXX-XXXX"
                                                                    v-model="newStudent.student_contact_info.contact.primary_number" />
                                                            </div>
                                                        </div>
                                                        <div class="w-full lg:mb-0 mb-3">
                                                            <label class="text-[10px] text-gray-300 lg:block hidden">
                                                                Alternate Contact Number</label>
                                                            <div>
                                                                <input type="text"
                                                                    class="w-full text-xs px-3 capitalize border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9"
                                                                    placeholder="(+63) XXX-XXX-XXXX"
                                                                    v-model="newStudent.student_contact_info.contact.alternate_number" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="w-full lg:mb-0 mb-3">
                                                        <label class="text-[10px] text-gray-300 lg:block hidden">
                                                            Personal Email Address
                                                        </label>
                                                        <div>
                                                            <input type="email"
                                                                class="w-full text-xs px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9"
                                                                placeholder="email@domain.com"
                                                                v-model="newStudent.student_contact_info.contact.personal_email_address" />
                                                        </div>
                                                    </div>
                                                    <div class="w-full lg:mb-0 mb-3">
                                                        <label class="text-[10px] text-gray-300 lg:block hidden">
                                                            LSU Email</label>
                                                        <div>
                                                            <input type="email"
                                                                class="w-full text-xs px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9"
                                                                placeholder="email@domain.com"
                                                                v-model="newStudent.student_contact_info.contact.lsu_email_address" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="border-b-4 lg:px-10 px-2 lg:pt-3 lg:pb-5 pt-5 pb-7"
                                            v-if="newStudent.student_personal_info.citizenship === 'non-filipino'">
                                            <p class="text-green-800 uppercase font-bold mb-1 lg:text-left text-center">
                                                ALIEN STATUS INFORMATION
                                            </p>
                                            <div class="gap-2 mb-3">
                                                <div class="lg:flex grid grid-cols-2 gap-3">
                                                    <div class="w-full">
                                                        <label class="text-[10px] text-gray-300">
                                                            Citizenship</label>
                                                        <input type="text"
                                                            class="w-full px-3 capitalize border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                            v-model="newStudent.alien_status_information.citizenship"
                                                            placeholder="Citizenship" />
                                                    </div>
                                                    <div class="w-full">
                                                        <label class="text-[10px] text-gray-300">
                                                            Visa Status
                                                        </label>
                                                        <input type="text"
                                                            class="w-full px-3 capitalize border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                            v-model="newStudent.alien_status_information.visa_status"
                                                            placeholder="Visa Status" />
                                                    </div>
                                                    <div class="w-full">
                                                        <label class="text-[10px] text-gray-300">
                                                            Last Day of Authorized Stay
                                                        </label>
                                                        <input type="text"
                                                            class="w-full px-3 capitalize border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                            v-model="newStudent.alien_status_information.last_day_of_authorized_stay"
                                                            placeholder="Last Day of Authorized Stay" />
                                                    </div>
                                                    <div class="w-full">
                                                        <label class="text-[10px] text-gray-300">
                                                            Agent Name
                                                        </label>
                                                        <input type="text"
                                                            class="w-full px-3 capitalize border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                            v-model="newStudent.alien_status_information.agent_name"
                                                            placeholder="Agent Name" />
                                                    </div>
                                                </div>
                                                <div class="lg:flex grid grid-cols-2 gap-3">
                                                    <div class="w-full">
                                                        <label class="text-[10px] text-gray-300">
                                                            Passport Number
                                                        </label>
                                                        <input type="text"
                                                            class="w-full px-3 capitalize border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                            v-model="newStudent.alien_status_information.passport_number"
                                                            placeholder="Passport Number" />
                                                    </div>
                                                    <div class="w-full">
                                                        <label class="text-[10px] text-gray-300">
                                                            Passport: Place Issued
                                                        </label>
                                                        <input type="text"
                                                            class="w-full px-3 capitalize border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                            v-model="newStudent.alien_status_information.passport_place_issued"
                                                            placeholder="Passport: Place Issued" />
                                                    </div>
                                                    <div class="w-full">
                                                        <label class="text-[10px] text-gray-300">
                                                            Passport: Date Issued
                                                        </label>
                                                        <input type="date"
                                                            class="w-full px-3 uppercase border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                            v-model="newStudent.alien_status_information.passport_date_issued"
                                                            placeholder="Passport: Date Issued" />
                                                    </div>
                                                    <div class="w-full">
                                                        <label class="text-[10px] text-gray-300">
                                                            Passport: Date of Expiry
                                                        </label>
                                                        <input type="date"
                                                            class="w-full px-3 uppercase border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                            v-model="newStudent.alien_status_information.passport_date_of_expiry"
                                                            placeholder="Passport: Date of Expiry" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="lg:flex grid grid-cols-2 gap-2">
                                                <div class="w-full">
                                                    <label class="text-[10px] text-gray-300">
                                                        ACR: I-CARD: Date Issued
                                                    </label>
                                                    <input type="date"
                                                        class="w-full px-3 uppercase border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                        v-model="newStudent.alien_status_information.acricard_date_issued"
                                                        placeholder="ACRICARD Date Issued" />
                                                </div>
                                                <div class="w-full">
                                                    <label class="text-[10px] text-gray-300">
                                                        ACR: I-CARD: Date of Expiry
                                                    </label>
                                                    <input type="date"
                                                        class="w-full px-3 uppercase border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                        v-model="newStudent.alien_status_information.acricard_date_of_expiry"
                                                        placeholder="ACRICARD Date of Expiry" />
                                                </div>
                                                <div class="w-full">
                                                    <label class="text-[10px] text-gray-300">
                                                        CRTS: Date Issued
                                                    </label>
                                                    <input type="date"
                                                        class="w-full px-3 uppercase border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                        v-model="newStudent.alien_status_information.crts_date_issued"
                                                        placeholder="CRTS Date Issued" />
                                                </div>
                                                <div class="w-full">
                                                    <label class="text-[10px] text-gray-300">
                                                        CRTS: Date of Expiry
                                                    </label>
                                                    <input type="date"
                                                        class="w-full px-3 uppercase border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                        v-model="newStudent.alien_status_information.crts_date_of_expiry"
                                                        placeholder="CRTS Date of Expiry" />
                                                </div>
                                                <div class="w-full">
                                                    <label class="text-[10px] text-gray-300">
                                                        SSP: Date Issued
                                                    </label>
                                                    <input type="date"
                                                        class="w-full px-3 uppercase border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                        v-model="newStudent.alien_status_information.ssp_date_issued"
                                                        placeholder="SSP Date Issued" />
                                                </div>
                                                <div class="w-full">
                                                    <label class="text-[10px] text-gray-300">
                                                        SSP: Date of Expiry
                                                    </label>
                                                    <input type="date"
                                                        class="w-full px-3 uppercase border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                        v-model="newStudent.alien_status_information.ssp_date_of_expiry"
                                                        placeholder="SSP Date of Expiry" />
                                                </div>
                                            </div>
                                        </div>
                                        <div class="py-5">
                                            <div class="justify-between flex">
                                                <div @click="toggleInfo(
                                                    true, false, false, false, false, false)"
                                                    class="cursor-pointer py-1 uppercase px-4 shadow bg-green-800 text-white hover:bg-white hover:text-green-800 rounded-lg mx-2">
                                                    <i class="fa fa-angle-double-left pr-2"></i> Prev
                                                </div>
                                                <div class="cursor-pointer py-1 uppercase px-4 shadow bg-green-800 text-white hover:bg-white hover:text-green-800 rounded-lg mx-2"
                                                    @click="toggleInfo(
                                                        false, false, true, false, false, false)">Next <i
                                                        class="fa fa-angle-double-right pl-2"></i></div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                                <div class="mx-auto border-t-2 border-green-700 mt-5 shadow-lg rounded-lg"
                                    v-show="toggle.familyInfo">
                                    <div>
                                        <div class="parents lg:flex">
                                            <div class="border-b-4 lg:px-10 px-3 py-5">
                                                <div>
                                                    <div>
                                                        <p class="text-green-800 uppercase font-bold mb-3">
                                                            Father Information
                                                        </p>
                                                    </div>
                                                    <div class="flex">
                                                        <div class="flex w-full">
                                                            <input type="radio" value="living"
                                                                v-model="newStudent.father_personal_info.vital_life_status"
                                                                class="mr-2" />
                                                            <label class="text-[10px] ">
                                                                Living
                                                            </label>
                                                        </div>
                                                        <div class="flex">
                                                            <input type="radio" value="deceased"
                                                                v-model="newStudent.father_personal_info.vital_life_status"
                                                                class="mr-2" />
                                                            <label class="text-[10px] ">
                                                                Deceased
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div class="py-5">
                                                        <p class="lg:mb-3 mb-2">Personal Details</p>
                                                        <div class="lg:grid lg:grid-cols-3">
                                                            <div class="lg:mb-0 mb-3">
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    Last Name</label>
                                                                <input type="text"
                                                                    class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                    v-model="newStudent.father_personal_info.lastname"
                                                                    placeholder="Last Name" />
                                                            </div>
                                                            <div class="lg:mb-0 mb-3">
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    First Name</label>
                                                                <input type="text"
                                                                    class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                    v-model="newStudent.father_personal_info.firstname"
                                                                    placeholder="First Name" />
                                                            </div>
                                                            <div class="lg:mb-0 mb-3">
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    Middle Name</label>
                                                                <input type="text"
                                                                    class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                    v-model="newStudent.father_personal_info.middlename"
                                                                    placeholder="Middle Name" />
                                                            </div>
                                                            <div class="lg:mb-0 mb-3">
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    Birth Date
                                                                </label>
                                                                <input type="text"
                                                                    class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                    v-model="newStudent.father_personal_info.birth_date"
                                                                    placeholder="Birth Date" />
                                                            </div>
                                                            <div class="lg:mb-0 mb-3">
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    Age</label>
                                                                <input type="text"
                                                                    class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                    v-model="newStudent.father_personal_info.age"
                                                                    placeholder="Age" />
                                                            </div>
                                                            <div class="lg:mb-0 mb-3">
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    Civil Status
                                                                </label>
                                                                <input type="text"
                                                                    class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                    v-model="newStudent.father_personal_info.civil_status"
                                                                    placeholder="Civil Status" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="py-5">
                                                        <p>Contact Details</p>
                                                        <div class="">
                                                            <div>
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    Permanent Address
                                                                </label>
                                                                <div class="lg:grid grid-cols-3">
                                                                    <input type="text"
                                                                        class="w-full lg:mb-3 mb-2px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.father_contact_info.permanent_living_home_address_category.street_or_purok"
                                                                        placeholder="Street or Purok" />

                                                                    <input type="text"
                                                                        class="w-full lg:mb-3 mb-2px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.father_contact_info.permanent_living_home_address_category.barangay_or_village"
                                                                        placeholder="Barangay or Village" />

                                                                    <input type="text"
                                                                        class="w-full lg:mb-3 mb-2px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.father_contact_info.permanent_living_home_address_category.city_or_municipality"
                                                                        placeholder="City or Municipality" />

                                                                    <input type="text"
                                                                        class="w-full lg:mb-3 mb-2px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.father_contact_info.permanent_living_home_address_category.zipcode"
                                                                        placeholder="Zip Code" />

                                                                    <input type="text"
                                                                        class="w-full lg:mb-3 mb-2px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.father_contact_info.permanent_living_home_address_category.province_or_state"
                                                                        placeholder="Province or State" />

                                                                    <input type="text"
                                                                        class="w-full lg:mb-3 mb-2px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.father_contact_info.permanent_living_home_address_category.region"
                                                                        placeholder="Region" />

                                                                    <input type="text"
                                                                        class="w-full lg:mb-3 mb-2px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.father_contact_info.permanent_living_home_address_category.country"
                                                                        placeholder="Country" />
                                                                </div>
                                                            </div>
                                                            <div class="mb-3 lg:flex items-center lg:pt-3">
                                                                <p
                                                                    class="text-xs text-green-900 mr-3 lg:pt-1 lg:text-left text-center">
                                                                    {{
                                                                        newStudent.father_contact_info.the_same_address.question
                                                                    }}
                                                                </p>
                                                                <div
                                                                    class="flex gap-3 pt-1 lg:mx-0 mx-auto w-fit lg:mb-0 mb-4 lg:mt-0 mt-2">
                                                                    <div @click="theSameAddressBtn('yesFatherContactInfo')"
                                                                        class="text-xs capitalize cursor-pointer px-3 rounded-lg hover:text-green-800 hover:bg-white border-2 border-green-800"
                                                                        :class="newStudent.father_contact_info.the_same_address.answer === 'yes' ? 'text-white bg-green-800' : 'text-green-800 bg-white border-2'">
                                                                        yes</div>
                                                                    <div @click="theSameAddressBtn('noFatherContactInfo')"
                                                                        class="text-xs capitalize cursor-pointer  px-3 rounded-lg hover:text-red-800 hover:bg-white border-2 border-red-800"
                                                                        :class="newStudent.father_contact_info.the_same_address.answer === 'no' ? 'text-white bg-red-800' : 'text-red-800 bg-white border-2'">
                                                                        no</div>
                                                                </div>
                                                            </div>
                                                            <div
                                                                :class="newStudent.father_contact_info.the_same_address.answer === 'yes' ? 'hidden' : ''">
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    Current Address
                                                                </label>
                                                                <div class="lg:grid grid-cols-3">
                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.father_contact_info.current_or_present_living_home_address_category.street_or_purok"
                                                                        placeholder="Street or Purok" />

                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.father_contact_info.current_or_present_living_home_address_category.barangay_or_village"
                                                                        placeholder="Barangay or Village" />

                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.father_contact_info.current_or_present_living_home_address_category.city_or_municipality"
                                                                        placeholder="City or Municipality" />

                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.father_contact_info.current_or_present_living_home_address_category.zipcode"
                                                                        placeholder="Zip Code" />

                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.father_contact_info.current_or_present_living_home_address_category.province_or_state"
                                                                        placeholder="Province or State" />

                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.father_contact_info.current_or_present_living_home_address_category.region"
                                                                        placeholder="Region" />

                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.father_contact_info.current_or_present_living_home_address_category.country"
                                                                        placeholder="Country" />

                                                                </div>
                                                            </div>
                                                            <div class="lg:flex">
                                                                <div class="w-full">
                                                                    <label
                                                                        class="text-[10px] text-gray-300 lg:block hidden">
                                                                        Contact Number
                                                                    </label>
                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.father_contact_info.contact.number"
                                                                        placeholder="Contact Number" />
                                                                </div>
                                                                <div class="w-full">
                                                                    <label
                                                                        class="text-[10px] text-gray-300 lg:block hidden">
                                                                        Email Address
                                                                    </label>
                                                                    <input type="email"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.father_contact_info.contact.email_address"
                                                                        placeholder="Email Address" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="py-5">
                                                        <p>Employment Details</p>
                                                        <div class="lg:grid lg:grid-cols-2">
                                                            <div>
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    Highest Education Completed
                                                                </label>
                                                                <input type="text"
                                                                    class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                    v-model="newStudent.father_employment_info.highest_education_completed"
                                                                    placeholder="Highest Education Completed" />
                                                            </div>
                                                            <div>
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    Occupation
                                                                </label>
                                                                <input type="text"
                                                                    class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                    v-model="newStudent.father_employment_info.occupation"
                                                                    placeholder="Occupation" />
                                                            </div>
                                                            <div>
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    Employment Status
                                                                </label>
                                                                <input type="text"
                                                                    class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                    v-model="newStudent.father_employment_info.employment_status"
                                                                    placeholder="Employment Status" />
                                                            </div>
                                                            <div>
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    Gross Monthly Income
                                                                </label>
                                                                <input type="text"
                                                                    class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                    v-model="newStudent.father_employment_info.gross_monthly_income"
                                                                    placeholder="Gross Monthly Income" />
                                                            </div>
                                                            <div>
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    Employer or Company
                                                                </label>
                                                                <input type="text"
                                                                    class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                    v-model="newStudent.father_employment_info.employer_or_company"
                                                                    placeholder="Employer or Company" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="border-b-4 lg:px-10 px-3 py-5">
                                                <div>
                                                    <div>
                                                        <p class="text-green-800 uppercase font-bold mb-3">
                                                            Mother Information
                                                        </p>
                                                    </div>
                                                    <div class="flex">
                                                        <div class="flex w-full">
                                                            <input type="radio" value="living"
                                                                v-model="newStudent.mother_personal_info.vital_life_status"
                                                                class="mr-2" />
                                                            <label class="text-[10px] ">
                                                                Living
                                                            </label>
                                                        </div>
                                                        <div class="flex">
                                                            <input type="radio" value="deceased"
                                                                v-model="newStudent.mother_personal_info.vital_life_status"
                                                                class="mr-2" />
                                                            <label class="text-[10px] ">
                                                                Deceased
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div class="py-5">
                                                        <p>Personal Details</p>
                                                        <div class="lg:grid lg:grid-cols-3">
                                                            <div>
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    Last Name</label>
                                                                <input type="text"
                                                                    class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                    v-model="newStudent.mother_personal_info.lastname"
                                                                    placeholder="Last Name" />
                                                            </div>
                                                            <div>
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    First Name</label>
                                                                <input type="text"
                                                                    class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                    v-model="newStudent.mother_personal_info.firstname"
                                                                    placeholder="First Name" />
                                                            </div>
                                                            <div>
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    Middle Name</label>
                                                                <input type="text"
                                                                    class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                    v-model="newStudent.mother_personal_info.middlename"
                                                                    placeholder="Middle Name" />
                                                            </div>
                                                            <div>
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    Birth Date
                                                                </label>
                                                                <input type="text"
                                                                    class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                    v-model="newStudent.mother_personal_info.birth_date"
                                                                    placeholder="Birth Date" />
                                                            </div>
                                                            <div>
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    Age</label>
                                                                <input type="text"
                                                                    class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                    v-model="newStudent.mother_personal_info.age"
                                                                    placeholder="Age" />
                                                            </div>
                                                            <div>
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    Civil Status
                                                                </label>
                                                                <input type="text"
                                                                    class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                    v-model="newStudent.mother_personal_info.civil_status"
                                                                    placeholder="Civil Status" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="py-5">
                                                        <p>Contact Details</p>
                                                        <div class="">
                                                            <div>
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    Permanent Address
                                                                </label>
                                                                <div class="lg:grid grid-cols-3">
                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.mother_contact_info.permanent_living_home_address_category.street_or_purok"
                                                                        placeholder="Street or Purok" />

                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.mother_contact_info.permanent_living_home_address_category.barangay_or_village"
                                                                        placeholder="Barangay or Village" />

                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.mother_contact_info.permanent_living_home_address_category.city_or_municipality"
                                                                        placeholder="City or Municipality" />

                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.mother_contact_info.permanent_living_home_address_category.zipcode"
                                                                        placeholder="Zip Code" />

                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.mother_contact_info.permanent_living_home_address_category.province_or_state"
                                                                        placeholder="Province or State" />

                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.mother_contact_info.permanent_living_home_address_category.region"
                                                                        placeholder="Region" />

                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.mother_contact_info.permanent_living_home_address_category.country"
                                                                        placeholder="Country" />
                                                                </div>
                                                            </div>
                                                            <div class="mb-3 lg:flex items-center lg:pt-3">
                                                                <p
                                                                    class="text-xs text-green-900 mr-3 lg:pt-1 lg:text-left text-center">
                                                                    {{
                                                                        newStudent.mother_contact_info.the_same_address.question
                                                                    }}
                                                                </p>
                                                                <div
                                                                    class="flex gap-3 pt-1 lg:mx-0 mx-auto w-fit lg:mb-0 mb-4 lg:mt-0 mt-2">
                                                                    <div @click="theSameAddressBtn('yesMotherContactInfo')"
                                                                        class="text-xs capitalize cursor-pointer px-3 rounded-lg hover:text-green-800 hover:bg-white border-2 border-green-800"
                                                                        :class="newStudent.mother_contact_info.the_same_address.answer === 'yes' ? 'text-white bg-green-800' : 'text-green-800 bg-white border-2'">
                                                                        yes</div>
                                                                    <div @click="theSameAddressBtn('noMotherContactInfo')"
                                                                        class="text-xs capitalize cursor-pointer  px-3 rounded-lg hover:text-red-800 hover:bg-white border-2 border-red-800"
                                                                        :class="newStudent.mother_contact_info.the_same_address.answer === 'no' ? 'text-white bg-red-800' : 'text-red-800 bg-white border-2'">
                                                                        no</div>
                                                                </div>
                                                            </div>


                                                            <div
                                                                :class="newStudent.mother_contact_info.the_same_address.answer === 'yes' ? 'hidden' : ''">
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    Current Address
                                                                </label>
                                                                <div class="lg:grid grid-cols-3">
                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.mother_contact_info.current_or_present_living_home_address_category.street_or_purok"
                                                                        placeholder="Street or Purok" />

                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.mother_contact_info.current_or_present_living_home_address_category.barangay_or_village"
                                                                        placeholder="Barangay or Village" />

                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.mother_contact_info.current_or_present_living_home_address_category.city_or_municipality"
                                                                        placeholder="City or Municipality" />

                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.mother_contact_info.current_or_present_living_home_address_category.zipcode"
                                                                        placeholder="Zip Code" />

                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.mother_contact_info.current_or_present_living_home_address_category.province_or_state"
                                                                        placeholder="Province or State" />

                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.mother_contact_info.current_or_present_living_home_address_category.region"
                                                                        placeholder="Region" />

                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.mother_contact_info.current_or_present_living_home_address_category.country"
                                                                        placeholder="Country" />
                                                                </div>
                                                            </div>
                                                            <div class="lg:flex">
                                                                <div class="w-full">
                                                                    <label
                                                                        class="text-[10px] text-gray-300 lg:block hidden">
                                                                        Contact Number
                                                                    </label>
                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.mother_contact_info.contact.number"
                                                                        placeholder="Contact Number" />
                                                                </div>
                                                                <div class="w-full">
                                                                    <label
                                                                        class="text-[10px] text-gray-300 lg:block hidden">
                                                                        Email Address
                                                                    </label>
                                                                    <input type="email"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.mother_contact_info.contact.email_address"
                                                                        placeholder="Email Address" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="py-5">
                                                        <p>Employment Details</p>
                                                        <div class="lg:grid lg:grid-cols-2">
                                                            <div>
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    Highest Education Completed
                                                                </label>
                                                                <input type="text"
                                                                    class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                    v-model="newStudent.mother_employment_info.highest_education_completed"
                                                                    placeholder="Highest Education Completed" />
                                                            </div>
                                                            <div>
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    Occupation
                                                                </label>
                                                                <input type="text"
                                                                    class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                    v-model="newStudent.mother_employment_info.occupation"
                                                                    placeholder="Occupation" />
                                                            </div>
                                                            <div>
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    Employment Status
                                                                </label>
                                                                <input type="text"
                                                                    class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                    v-model="newStudent.mother_employment_info.employment_status"
                                                                    placeholder="Employment Status" />
                                                            </div>
                                                            <div>
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    Gross Monthly Income
                                                                </label>
                                                                <input type="text"
                                                                    class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                    v-model="newStudent.mother_employment_info.gross_monthly_income"
                                                                    placeholder="Gross Monthly Income" />
                                                            </div>
                                                            <div>
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    Employer or Company
                                                                </label>
                                                                <input type="text"
                                                                    class="w-full px-3 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                    v-model="newStudent.mother_employment_info.employer_or_company"
                                                                    placeholder="Employer or Company" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="border-b-4 lg:px-10 px-3 py-5">
                                                <div>
                                                    <div>
                                                        <p class="text-green-800 uppercase font-bold mb-3">
                                                            Guardian Information
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <div class="flex items-center">
                                                            <label class="text-[10px] mr-3">
                                                                Relation
                                                            </label>
                                                            <input type="text"
                                                                class="w-fit px-3 border-b border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm text-xs"
                                                                v-model="newStudent.legal_guardian_personal_info.relation_to_student"
                                                                placeholder="Relation" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="">
                                                    <div class="py-5">
                                                        <p class="">Personal Details</p>
                                                        <div class="">
                                                            <div class="lg:grid grid-cols-3">
                                                                <div>
                                                                    <label
                                                                        class="text-[10px] text-gray-300 lg:block hidden">
                                                                        Last Name</label>
                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                        border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.legal_guardian_personal_info.lastname"
                                                                        placeholder="Last Name" />
                                                                </div>

                                                                <div>
                                                                    <label
                                                                        class="text-[10px] text-gray-300 lg:block hidden">
                                                                        First Name</label>
                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                        border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.legal_guardian_personal_info.firstname"
                                                                        placeholder="First Name" />
                                                                </div>
                                                                <div>
                                                                    <label
                                                                        class="text-[10px] text-gray-300 lg:block hidden">
                                                                        Middle Name</label>
                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                        border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.legal_guardian_personal_info.middlename"
                                                                        placeholder="Middle Name" />
                                                                </div>

                                                                <div>
                                                                    <label
                                                                        class="text-[10px] text-gray-300 lg:block hidden">
                                                                        Birth Date
                                                                    </label>
                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                        border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.legal_guardian_personal_info.birth_date"
                                                                        placeholder="Birth Date" />
                                                                </div>
                                                                <div>
                                                                    <label
                                                                        class="text-[10px] text-gray-300 lg:block hidden">
                                                                        Age</label>
                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                        border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.legal_guardian_personal_info.age"
                                                                        placeholder="Age" />
                                                                </div>
                                                                <div>
                                                                    <label
                                                                        class="text-[10px] text-gray-300 lg:block hidden">
                                                                        Civil Status
                                                                    </label>
                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                        border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.legal_guardian_personal_info.civil_status"
                                                                        placeholder="Civil Status" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="py-5">
                                                        <p>Contact Details</p>
                                                        <div class="">
                                                            <div>
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    Permanent Address
                                                                </label>
                                                                <div class="lg:grid grid-cols-3">
                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                        border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.legal_guardian_contact_info.permanent_living_home_address_category.street_or_purok"
                                                                        placeholder="Street or Purok" />

                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                        border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.legal_guardian_contact_info.permanent_living_home_address_category.barangay_or_village"
                                                                        placeholder="Barangay or Village" />

                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                        border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.legal_guardian_contact_info.permanent_living_home_address_category.city_or_municipality"
                                                                        placeholder="City or Municipality" />

                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                        border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.legal_guardian_contact_info.permanent_living_home_address_category.zipcode"
                                                                        placeholder="Zip Code" />

                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                        border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.legal_guardian_contact_info.permanent_living_home_address_category.province_or_state"
                                                                        placeholder="Province or State" />

                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                        border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.legal_guardian_contact_info.permanent_living_home_address_category.region"
                                                                        placeholder="Region" />

                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                        border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.legal_guardian_contact_info.permanent_living_home_address_category.country"
                                                                        placeholder="Country" />

                                                                </div>
                                                            </div>

                                                            <div class="mb-3 lg:flex items-center lg:pt-3">
                                                                <p
                                                                    class="text-xs text-green-900 mr-3 lg:pt-1 lg:text-left text-center">
                                                                    {{
                                                                        newStudent.legal_guardian_contact_info.the_same_address.question
                                                                    }}
                                                                </p>
                                                                <div
                                                                    class="flex gap-3 pt-1 lg:mx-0 mx-auto w-fit lg:mb-0 mb-4 lg:mt-0 mt-2">
                                                                    <div @click="theSameAddressBtn('yesGuardianContactInfo')"
                                                                        class="text-xs capitalize cursor-pointer px-3 rounded-lg hover:text-green-800 hover:bg-white border-2 border-green-800"
                                                                        :class="newStudent.legal_guardian_contact_info.the_same_address.answer === 'yes' ? 'text-white bg-green-800' : 'text-green-800 bg-white border-2'">
                                                                        yes</div>
                                                                    <div @click="theSameAddressBtn('noGuardianContactInfo')"
                                                                        class="text-xs capitalize cursor-pointer  px-3 rounded-lg hover:text-red-800 hover:bg-white border-2 border-red-800"
                                                                        :class="newStudent.legal_guardian_contact_info.the_same_address.answer === 'no' ? 'text-white bg-red-800' : 'text-red-800 bg-white border-2'">
                                                                        no</div>
                                                                </div>
                                                            </div>



                                                            <div
                                                                :class="newStudent.legal_guardian_contact_info.the_same_address.answer === 'yes' ? 'hidden' : ''">
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    Current Address
                                                                </label>
                                                                <div class="lg:grid grid-cols-3">
                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                        border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.legal_guardian_contact_info.current_or_present_living_home_address_category.street_or_purok"
                                                                        placeholder="Street or Purok" />

                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                        border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.legal_guardian_contact_info.current_or_present_living_home_address_category.barangay_or_village"
                                                                        placeholder="Barangay or Village" />

                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                        border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.legal_guardian_contact_info.current_or_present_living_home_address_category.city_or_municipality"
                                                                        placeholder="City or Municipality" />

                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                        border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.legal_guardian_contact_info.current_or_present_living_home_address_category.zipcode"
                                                                        placeholder="Zip Code" />

                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                        border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.legal_guardian_contact_info.current_or_present_living_home_address_category.province_or_state"
                                                                        placeholder="Province or State" />

                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                        border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.legal_guardian_contact_info.current_or_present_living_home_address_category.region"
                                                                        placeholder="Region" />

                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                        border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.legal_guardian_contact_info.current_or_present_living_home_address_category.country"
                                                                        placeholder="Country" />
                                                                </div>
                                                            </div>
                                                            <div class="lg:flex">
                                                                <div class="w-full">
                                                                    <label
                                                                        class="text-[10px] text-gray-300 lg:block hidden">
                                                                        Contact Number
                                                                    </label>
                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                        border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.legal_guardian_contact_info.contact.number"
                                                                        placeholder="Contact Number" />
                                                                </div>
                                                                <div class="w-full">
                                                                    <label
                                                                        class="text-[10px] text-gray-300 lg:block hidden">
                                                                        Email Address
                                                                    </label>
                                                                    <input type="email"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                        border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.legal_guardian_contact_info.contact.email_address"
                                                                        placeholder="Email Address" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="py-5">
                                                        <p>Employment Details</p>
                                                        <div class="lg:grid lg:grid-cols-2">
                                                            <div>
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    Highest Education Completed
                                                                </label>
                                                                <input type="text" class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                    border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                    v-model="newStudent.legal_guardian_employment_info.highest_education_completed"
                                                                    placeholder="Highest Education Completed" />
                                                            </div>
                                                            <div>
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    Occupation
                                                                </label>
                                                                <input type="text" class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                    border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                    v-model="newStudent.legal_guardian_employment_info.occupation"
                                                                    placeholder="Occupation" />
                                                            </div>
                                                            <div>
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    Employment Status
                                                                </label>
                                                                <input type="text" class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                    border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                    v-model="newStudent.legal_guardian_employment_info.employment_status"
                                                                    placeholder="Employment Status" />
                                                            </div>
                                                            <div>
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    Gross Monthly Income
                                                                </label>
                                                                <input type="text" class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                    border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                    v-model="newStudent.legal_guardian_employment_info.gross_monthly_income"
                                                                    placeholder="Gross Monthly Income" />
                                                            </div>
                                                            <div>
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    Employer or Company
                                                                </label>
                                                                <input type="text" class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                    border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                    v-model="newStudent.legal_guardian_employment_info.employer_or_company"
                                                                    placeholder="Employer or Company" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="guardian">
                                            <div class="border-b-4 lg:px-10 px-3 py-5">
                                                <p class="text-green-800 uppercase font-bold mb-3">
                                                    Emergency Contact Information
                                                </p>
                                                <div class="">
                                                    <div class="lg:grid grid-cols-6">
                                                        <div class="w-full">
                                                            <label class="text-[10px] text-gray-300 lg:block hidden">
                                                                Title</label>

                                                            <input type="text" class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                v-model="newStudent.student_emergency_contact_information.personal_info.title"
                                                                placeholder="Title" />
                                                        </div>
                                                        <div class="w-full">
                                                            <label class="text-[10px] text-gray-300 lg:block hidden">
                                                                Last Name</label>

                                                            <input type="text" class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                v-model="newStudent.student_emergency_contact_information.personal_info.lastname"
                                                                placeholder="Last Name" />
                                                        </div>
                                                        <div class="w-full">
                                                            <label class="text-[10px] text-gray-300 lg:block hidden">
                                                                First Name</label>

                                                            <input type="text" class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                v-model="newStudent.student_emergency_contact_information.personal_info.firstname"
                                                                placeholder="First Name" />
                                                        </div>
                                                        <div class="w-full">
                                                            <label class="text-[10px] text-gray-300 lg:block hidden">
                                                                Middle Name</label>

                                                            <input type="text" class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                v-model="newStudent.student_emergency_contact_information.personal_info.middlename"
                                                                placeholder="Middle Name" />
                                                        </div>
                                                        <div class="w-full">
                                                            <label class="text-[10px] text-gray-300 lg:block hidden">
                                                                Extension or Suffix Name</label>

                                                            <input type="text" class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                v-model="newStudent.student_emergency_contact_information.personal_info.extension_or_suffix_name"
                                                                placeholder="Extension or Suffix Name" />
                                                        </div>

                                                        <div class="w-full">
                                                            <label class="text-[10px] text-gray-300 lg:block hidden">
                                                                Relation to Student</label>
                                                            <input type="text" class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                v-model="newStudent.student_emergency_contact_information.personal_info.relation_to_student"
                                                                placeholder="Relation to Student" />
                                                        </div>
                                                    </div>

                                                    <div class="py-5">
                                                        <p class="">Contact Details</p>
                                                        <div class="">
                                                            <div>
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    Address
                                                                </label>
                                                                <div class="lg:grid grid-cols-7">
                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                        border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.student_emergency_contact_information.address.street_or_purok"
                                                                        placeholder="Street or Purok" />

                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                        border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.student_emergency_contact_information.address.barangay_or_village"
                                                                        placeholder="Barangay or Village" />

                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                        border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.student_emergency_contact_information.address.city_or_municipality"
                                                                        placeholder="City or Municipality" />

                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                        border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.student_emergency_contact_information.address.zipcode"
                                                                        placeholder="Zip Code" />

                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0
                                                                         border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.student_emergency_contact_information.address.province_or_state"
                                                                        placeholder="Province or State" />

                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                        border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.student_emergency_contact_information.address.region"
                                                                        placeholder="Region" />

                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                        border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.student_emergency_contact_information.address.country"
                                                                        placeholder="Country" />
                                                                </div>
                                                            </div>
                                                            <div class="lg:flex">
                                                                <div class="w-full">
                                                                    <label
                                                                        class="text-[10px] text-gray-300 lg:block hidden">
                                                                        Primary Contact Number
                                                                    </label>
                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                        border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.student_emergency_contact_information.contact.primary_number"
                                                                        placeholder="Primary Contact Number" />
                                                                </div>
                                                                <div class="w-full">
                                                                    <label
                                                                        class="text-[10px] text-gray-300 lg:block hidden">
                                                                        Alternate Contact Number
                                                                    </label>
                                                                    <input type="text"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                        border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.student_emergency_contact_information.contact.alternate_number"
                                                                        placeholder="Alternate Contact Number" />
                                                                </div>
                                                                <div class="w-full">
                                                                    <label
                                                                        class="text-[10px] text-gray-300 lg:block hidden">
                                                                        Email Address
                                                                    </label>
                                                                    <input type="email"
                                                                        class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                        border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                        v-model="newStudent.student_emergency_contact_information.contact.email_address"
                                                                        placeholder="Email Address" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="border-b-4 lg:px-10 px-3 py-5">
                                            <p class="text-green-800 uppercase font-bold mb-3">Sibling Information</p>
                                            <div>
                                                <div class="lg:flex lg:shadow rounded-xl lg:p-5 mt-2 mb-3 relative"
                                                    v-for="(b, i) in newStudent.siblings" :key="i">
                                                    <div class="flex items-center mr-3">
                                                        <div
                                                            class="flex items-center lg:mr-3 mt-3 font-bold justify-center bg-green-900 text-white rounded-full h-8 w-8 py-2 px-2.5 text-sm mb-2">
                                                            {{ i + 1 }}
                                                        </div>
                                                    </div>
                                                    <div class="w-full">
                                                        <div class="lg:flex personal-details">
                                                            <div class="w-full lg:mb-0 mb-2">
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    Last Name
                                                                </label>
                                                                <input class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                    border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                    placeholder="Last Name" type="text" required
                                                                    v-model="b.lastname" />
                                                            </div>
                                                            <div class="w-full lg:mb-0 mb-2">
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    First Name
                                                                </label>
                                                                <input class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                    border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                    placeholder="First Name" type="text"
                                                                    v-model="b.firstname" required />
                                                            </div>
                                                            <div class="w-full lg:mb-0 mb-2">
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    Middle Name
                                                                </label>
                                                                <input class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                    border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                    placeholder="Middle Name" type="text"
                                                                    v-model="b.middlename" required />
                                                            </div>
                                                            <div class="w-full lg:mb-0 mb-2">
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    Birth Date
                                                                </label>
                                                                <input class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                    border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                    placeholder="Birth Date" type="text"
                                                                    v-model="b.birth_date" required />
                                                            </div>
                                                            <div class="w-full lg:mb-0 mb-2">
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    Age
                                                                </label>
                                                                <!-- transfer it to select -->
                                                                <input class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                    border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                    placeholder="Age" type="number" v-model="b.age"
                                                                    required />
                                                            </div>
                                                            <div class="w-full lg:mb-0 mb-2">
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    Civil Status
                                                                </label>
                                                                <input class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                    border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                    placeholder="Civil Status" type="text"
                                                                    v-model="b.civil_status" required />
                                                            </div>
                                                        </div>
                                                        <div class="lg:flex educational-details">
                                                            <div class="w-full lg:mb-0 mb-2">
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    Grade or Year Level
                                                                </label>
                                                                <input class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                    border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                    v-model="b.grade_or_year_level"
                                                                    placeholder="Grade or Year Level" type="text"
                                                                    required />
                                                            </div>
                                                            <div class="w-full lg:mb-0 mb-2">
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    School or Graduated From
                                                                </label>
                                                                <input class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                    border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                    placeholder="School or Graduated From" type="text"
                                                                    v-model="b.school_or_graduated_from" required />
                                                            </div>
                                                            <div class="w-full lg:mb-0 mb-2">
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    Highest Education Completed
                                                                </label>
                                                                <input class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                    border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                    placeholder="Highest Education Completed"
                                                                    type="text" v-model="b.highest_education_completed"
                                                                    required />
                                                            </div>
                                                            <div class="w-full lg:mb-0 mb-2">
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    Occupation
                                                                </label>
                                                                <input class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                    border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                    v-model="b.occupation" placeholder="Occupation"
                                                                    type="text" required />
                                                            </div>
                                                            <div class="w-full lg:mb-0 mb-2">
                                                                <label
                                                                    class="text-[10px] text-gray-300 lg:block hidden">
                                                                    Employer or Company
                                                                </label>
                                                                <input class="w-full px-3 border-b-2 border-t-0 border-x-0 
                                                                    border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                                                    v-model="b.employer_or_company"
                                                                    placeholder="Employer or Company" type="text"
                                                                    required />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="flex items-center lg:static absolute top-3 right-0"
                                                        v-if="newStudent.siblings.length > 0">
                                                        <div class="mr-2 lg:hidden block">Remove</div>
                                                        <div class="flex items-center lg:ml-5 lg:mt-5 justify-center hover:bg-white bg-red-900 border border-red-900 hover:text-red-900 text-white rounded-full h-8 w-8 pt-2 pb-1.5 px-2.5 text-sm"
                                                            @click="removeRowSibling(b)">
                                                            <i class="fa fa-close"></i>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="lg:ml-2">
                                                    <div class="hover:text-[#f4ca16] border border-[#f4ca16] text-white cursor-pointer w-fit mb-3 hover:bg-white bg-[#f4ca16] font-bold uppercase text-xs rounded-md px-3 py-2 text-center lg:-ml-2"
                                                        @click="addSibling">
                                                        <i class="fa fa-plus mr-1"></i> Add Sibling
                                                    </div>
                                                </div>
                                            </div>
                                        </div>



                                        <div class="py-5">
                                            <div class="justify-between flex">
                                                <div @click="toggleInfo(
                                                    false, true, false, false, false, false)"
                                                    class="cursor-pointer py-1 uppercase px-4 shadow bg-green-800 text-white hover:bg-white hover:text-green-800 rounded-lg mx-2">
                                                    <i class="fa fa-angle-double-left pr-2"></i> Prev
                                                </div>
                                                <div class="cursor-pointer py-1 uppercase px-4 shadow bg-green-800 text-white hover:bg-white hover:text-green-800 rounded-lg mx-2"
                                                    @click="toggleInfo(
                                                        false, false, false, true, false, false)">Next <i
                                                        class="fa fa-angle-double-right pl-2"></i></div>
                                            </div>
                                        </div>


                                    </div>
                                </div>
                                <div class="mx-auto border-t-2 border-green-700 mt-5 shadow-lg rounded-lg pt-5"
                                    v-show="toggle.education">
                                    <div>
                                        <div class="border-b-4 lg:px-5 pb-3">
                                            <div class="lg:px-0 px-3">
                                                <p class="text-green-800 uppercase font-bold mb-3">EDUCATIONAL
                                                    INFORMATION
                                                </p>
                                                <p class="text-xs text-gray-500 mb-3">
                                                    Please add all your previous educational detail information and
                                                    double
                                                    click the tabs to fill.
                                                </p>
                                            </div>
                                            <div
                                                class="shadow pt-5 pb-2 lg:px-4 bg-green-100 rounded-xl w-11/12 mx-auto">
                                                <div class="mb-3 lg:flex w-full gap-5 lg:px-0 px-10">
                                                    <div class="lg:flex items-center lg:w-full cursor-pointer lg:mb-0 mb-2"
                                                        v-for="(b, i) in newStudent.student_educational_info.tab"
                                                        :key="i" @click="expandEducationalDetails(b)">
                                                        <span
                                                            class="justify-between flex w-full items-center px-2 py-1 h-fit whitespace-nowrap hover:bg-green-700 hover:text-white rounded-lg"
                                                            :class="b === currentEducationalTab ? 'bg-white text-green-800 font-bold border-b-4 border-green-900 border-t border-x py-1.5' : 'bg-green-900 border-4 border-green-900 text-white'">
                                                            <span class="lg:text-sm text-xs">
                                                                {{ b }}
                                                            </span>
                                                            <i class="fa fa-angle-double-right rotate-90 ml-5"></i>
                                                        </span>
                                                    </div>
                                                </div>
                                                <div class="px-2" v-for="(b, i) in educationalActiveTabFilter" :key="i">
                                                    <div class="lg:flex items-end rounded-xl gap-2 mb-3 relative">
                                                        <div class="lg:w-[800px] w-full lg:mb-0 mb-1">
                                                            <label
                                                                class="text-[10px] text-gray-900 mb-1 lg:block hidden lg:whitespace-nowrap">
                                                                Education Level
                                                            </label>
                                                            <input
                                                                class="w-full px-3 capitalize font-bold text-green-800 border-x-0 border-t-0 border-b-2 border-green-900 shadow-lg rounded-sm lg:h-9 h-7 text-xs text-center"
                                                                v-model="b.education_level"
                                                                placeholder="Education Level" type="text" required
                                                                disabled />
                                                        </div>
                                                        <div class="w-full lg:mb-0 mb-1">
                                                            <label
                                                                class="text-[10px] text-gray-900 mb-1 lg:block hidden">
                                                                Name of Previous School
                                                            </label>
                                                            <input
                                                                class="w-full px-3 capitalize border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm lg:h-9 h-7 text-xs"
                                                                v-model="b.name_of_previous_school"
                                                                placeholder="Name of Previous School" type="text"
                                                                required />
                                                        </div>
                                                        <div class="w-full lg:mb-0 mb-1">
                                                            <label
                                                                class="text-[10px] text-gray-900 mb-1 lg:block hidden">
                                                                Track or Program
                                                            </label>
                                                            <input
                                                                class="w-full px-3 capitalize border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm lg:h-9 h-7 text-xs"
                                                                v-model="b.track_or_program"
                                                                placeholder="Track or Program" type="text" required />
                                                        </div>
                                                        <div class="w-full lg:mb-0 mb-1">
                                                            <label
                                                                class="text-[10px] text-gray-900 mb-1 lg:block hidden">
                                                                Highest Honors Received
                                                            </label>
                                                            <input
                                                                class="w-full px-3 capitalize border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm lg:h-9 h-7 text-xs"
                                                                v-model="b.highest_honors_received"
                                                                placeholder="Highest Honors Received" type="text"
                                                                required />
                                                        </div>
                                                        <div class="w-full lg:mb-0 mb-1">
                                                            <label
                                                                class="text-[10px] text-gray-900 mb-1 lg:block hidden">
                                                                City or Municipality and Province
                                                            </label>
                                                            <input
                                                                class="w-full px-3 capitalize border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm lg:h-9 h-7 text-xs"
                                                                v-model="b.city_or_municipality_and_province"
                                                                placeholder="City or Municipality and Province"
                                                                type="text" required />
                                                        </div>
                                                        <div class="w-full lg:mb-0 mb-1">
                                                            <label
                                                                class="text-[10px] text-gray-900 mb-1 lg:block hidden">
                                                                Year Last Attended or Graduated
                                                            </label>
                                                            <input
                                                                class="w-full px-3 capitalize border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm lg:h-9 h-7 text-xs"
                                                                v-model="b.year_graduated_or_attended"
                                                                placeholder="Year Last Attended or Graduated"
                                                                type="text" required />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="shadow pb-2 px-4 mt-4 bg-green-100 rounded-xl w-11/12 mx-auto">
                                                <div class="lg:flex lg:py-3 py-2 gap-3">
                                                    <div class="w-full">
                                                        <label class="text-xs text-gray-700">
                                                            Learner Reference Number
                                                        </label>
                                                        <input
                                                            class="w-full px-3 capitalize border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm lg:h-9 h-6 text-xs"
                                                            placeholder="Learner Reference Number" type="text" required
                                                            v-model="newStudent.student_education_information_number.learner_reference_number" />
                                                    </div>
                                                    <div class="w-full">
                                                        <label class="text-xs text-gray-700">CHEd Award Number</label>
                                                        <input
                                                            class="w-full px-3 capitalize border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm lg:h-9 h-6 text-xs"
                                                            placeholder="CHEd Award Number" type="text" required
                                                            v-model="newStudent.student_education_information_number.ched_award_number" />
                                                    </div>
                                                    <div class="w-full">
                                                        <label class="text-xs text-gray-700">DWSD Household
                                                            Number</label>
                                                        <input
                                                            class="w-full px-3 capitalize border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm lg:h-9 h-6 text-xs"
                                                            placeholder="DWSD Household Number" type="text" required
                                                            v-model="newStudent.student_education_information_number.dswd_household_number" />
                                                    </div>
                                                </div>
                                            </div>




                                        </div>

                                        <div class="py-5">
                                            <div class="justify-between flex">
                                                <div @click="toggleInfo(
                                                    false, false, true, false, false, false)"
                                                    class="cursor-pointer py-1 uppercase px-4 shadow bg-green-800 text-white hover:bg-white hover:text-green-800 rounded-lg mx-2">
                                                    <i class="fa fa-angle-double-left pr-2"></i> Prev
                                                </div>
                                                <div class="cursor-pointer py-1 uppercase px-4 shadow bg-green-800 text-white hover:bg-white hover:text-green-800 rounded-lg mx-2"
                                                    @click="toggleInfo(
                                                        false, false, false, false, true, false)">Next <i
                                                        class="fa fa-angle-double-right pl-2"></i></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="mx-auto border-t-2 border-green-700 mt-5 shadow-lg rounded-lg pt-5"
                                    v-show="toggle.survey">
                                    <div class="border-b-4 lg:px-10 px-3 pb-5 lg:flex items-center">
                                        <p
                                            class="text-green-800 font-semibold lg:w-[150px] pt-2 text-sm lg:mr-5 lg:mb-3 mb-4">
                                            What are your Top 3 programs of choice?
                                        </p>
                                        <div class="w-full">
                                            <div class="lg:flex gap-3">
                                                <div class="w-full lg:block flex items-center lg:mb-0 mb-3">
                                                    <label class="text-xs text-gray-700 lg:ml-0 mr-2 w-[20px]">1st
                                                        <!-- <span class="text-red-500">*</span> -->
                                                    </label>
                                                    <select required
                                                        v-model="newStudent.student_choice.choice_track_program_one_course_program"
                                                        class="w-full px-3 capitalize border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs">
                                                        <option value="" disabled selected>Select Course Program
                                                        </option>
                                                        <option :value="cp" v-for="(cp, i) in courseOrProgramData"
                                                            :key="i">
                                                            {{ cp }}
                                                        </option>
                                                    </select>
                                                </div>
                                                <div class="w-full lg:block flex items-center lg:mb-0 mb-3">
                                                    <label class="text-xs text-gray-700 lg:ml-0 mr-2 w-[20px]">2nd
                                                        <!-- <span class="text-red-500">*</span> -->
                                                    </label>
                                                    <select required
                                                        v-model="newStudent.student_choice.choice_track_program_two_course_program"
                                                        class="w-full px-3 capitalize border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs">
                                                        <option value="" disabled selected>Select Course Program
                                                        </option>
                                                        <option :value="cp" v-for="(cp, i) in courseOrProgramData"
                                                            :key="i">
                                                            {{ cp }}
                                                        </option>
                                                    </select>
                                                </div>
                                                <div class="w-full lg:block flex items-center lg:mb-0 mb-3">
                                                    <label class="text-xs text-gray-700 lg:ml-0 mr-2 w-[20px]">3rd
                                                        <!-- <span class="text-red-500">*</span> -->
                                                    </label>
                                                    <select required
                                                        v-model="newStudent.student_choice.choice_track_program_three_course_program"
                                                        class="w-full px-3 capitalize border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs">
                                                        <option value="" disabled selected>Select Course Program
                                                        </option>
                                                        <option :value="cp" v-for="(cp, i) in courseOrProgramData"
                                                            :key="i">
                                                            {{ cp }}
                                                        </option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="border-b-4">
                                        <div class="lg:flex lg:w-9/12 w-11/12 mx-auto gap-40 lg:pb-0 pb-3">
                                            <div class="w-full lg:py-5 pt-3">
                                                <div class="">
                                                    <p class="font-bold text-md text-green-900 mb-2">
                                                        {{ newStudent.how_you_learn_about_lsu.question }}
                                                    </p>
                                                    <ul class="ml-2">
                                                        <li v-for="(li, i) in newStudent.how_you_learn_about_lsu.list_items"
                                                            :key="i" class="flex mb-3">
                                                            <input class="mr-2" type="checkbox" v-model="li.value"
                                                                :value="li.value" />
                                                            <label class="capitalize text-xs text-green-900">
                                                                {{ li.label }}
                                                            </label>
                                                            <input v-model="li.description" placeholder="please specify"
                                                                :class="li.label === 'Others' && li.value ? '' : 'hidden'"
                                                                class="ml-3 lg:w-44 w-full px-3 capitalize border-b-2 py-1 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-[23px] text-xs" />
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                            <div class="w-full lg:py-5 pt-3">
                                                <div class="">
                                                    <p class="font-bold text-md text-green-900 mb-2">
                                                        {{ newStudent.reasons_for_choosing_lsu.question }}</p>
                                                    <ul class="ml-2">
                                                        <li v-for="(li, i) in newStudent.reasons_for_choosing_lsu.list_items"
                                                            :key="i" class="flex mb-3">
                                                            <input class="mr-2" type="checkbox" v-model="li.value"
                                                                :value="li.value" />
                                                            <label class="capitalize text-xs text-green-900">
                                                                {{ li.label }}
                                                            </label>
                                                            <input v-model="li.description" placeholder="please specify"
                                                                :class="li.label === 'Others' && li.value ? '' : 'hidden'"
                                                                class="ml-3 lg:w-44 w-full px-3 capitalize border-b-2 py-1 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-[23px] text-xs" />
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="shadow lg:px-8 px-3 lg:py-7 py-3">
                                        <h2
                                            class="font-bold capitalize mb-3 text-green-900 text-center border-b pb-4 leading-tight tracking-tight">
                                            Household Capacity and Access to Distance Learning
                                        </h2>
                                        <div>
                                            <ul class="lg:grid grid-cols-2 gap-10">
                                                <li v-for="(h, i) in newStudent.household_capacity_and_access_to_distance_learning"
                                                    :key="i" class="py-2 text-xs">
                                                    <!-- <div v-if="h.question === '2. Do you have access to the internet?'">
                                                        <p class="mb-3 font-bold">{{ h.question }}</p>
                                                        <ul class="lg:grid grid-cols-2 gap-2">
                                                            <li v-for="(li, i) in h.list_items" :key="i"
                                                                class="text-xs flex items-center">
                                                                <div :class="li.label === 'yes'">
                                                                    <input v-model="li.value" value="true" type="radio"
                                                                        class="mr-2" />
                                                                    yes
                                                                </div>
                                                            </li>
                                                            <li v-for="(li, i) in h.list_items" :key="i"
                                                                class="text-xs flex items-center">
                                                                <div :class="li.label === 'no'">
                                                                    <input v-model="li.value" value="false" type="radio"
                                                                        class="mr-2" />
                                                                    no
                                                                </div>
                                                            </li>
                                                        </ul>
                                                    </div> -->
                                                    <div>
                                                        <p class="mb-3 font-bold">{{ h.question }}</p>
                                                        <ul class="lg:grid grid-cols-2 gap-2">
                                                            <li v-for="(li, i) in h.list_items" :key="i"
                                                                class="text-xs flex items-center lg:mb-0 mb-3">
                                                                <input v-model="li.value" :value="li.label"
                                                                    type="checkbox" class="mr-2" />
                                                                {{ li.label }}
                                                                <input v-model="li.description"
                                                                    placeholder="please specify"
                                                                    :class="li.label === 'Others' && li.value ? '' : 'hidden'"
                                                                    class="ml-3 lg:w-44 w-full px-3 capitalize border-b-2 py-1 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-[23px] text-xs" />
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div class="py-5">
                                        <div class="justify-between flex">
                                            <div @click="toggleInfo(
                                                false, false, false, true, false, false)"
                                                class="cursor-pointer py-1 uppercase px-4 shadow bg-green-800 text-white hover:bg-white hover:text-green-800 rounded-lg mx-2">
                                                <i class="fa fa-angle-double-left pr-2"></i> Prev
                                            </div>
                                            <div class="cursor-pointer py-1 uppercase px-4 shadow bg-green-800 text-white hover:bg-white hover:text-green-800 rounded-lg mx-2"
                                                @click="toggleInfo(
                                                    false, false, false, false, false, true)">Next <i
                                                    class="fa fa-angle-double-right pl-2"></i></div>
                                        </div>
                                    </div>




                                </div>
                                <div class="mx-auto border-t-2 border-green-700 mt-5 shadow-lg rounded-lg"
                                    v-show="toggle.certification">
                                    <div class="shadow lg:px-10 px-3 py-5 text-green-900">
                                        <h2 class="font-bold capitalize text-green-900">HEALTH INFORMATION</h2>
                                        <p class="text-xs mb-3">
                                            <span class="font-bold text-green-900 mr-1">
                                                {{ newStudent.has_health_condition.text[0] }}
                                            </span>
                                            <span>
                                                {{ newStudent.has_health_condition.text[1] }}
                                            </span>
                                        </p>
                                        <p class="text-xs mb-3">
                                            {{ newStudent.has_health_condition.text[2] }}
                                        </p>
                                        <p class="text-xs mb-3">
                                            {{ newStudent.has_health_condition.text[3] }}
                                        </p>
                                        <p class="text-xs mb-3">
                                            {{ newStudent.has_health_condition.text[4] }}
                                        </p>
                                        <div class="my-3 flex items-center">
                                            <input type="checkbox" class="mr-1.5"
                                                v-model="newStudent.has_health_condition.answer" value="true" />
                                            <label class="text-xs font-bold">
                                                {{ newStudent.has_health_condition.text[5] }}
                                            </label>
                                        </div>
                                    </div>



                                    <div class="shadow lg:px-10 px-3 py-5 text-green-900">
                                        <h2 class="font-bold capitalize text-green-900">
                                            MEDIA RELEASE CONSENT
                                        </h2>
                                        <p class="text-xs">
                                            {{ newStudent.media_release_consent.text[0] }}
                                            <span class="font-bold text-green-900">
                                                {{ newStudent.media_release_consent.text[1] }}
                                            </span>
                                        </p>
                                        <p class="text-xs mb-3">
                                            {{ newStudent.media_release_consent.text[2] }}
                                        </p>
                                        <p class="text-xs mb-3">
                                            {{ newStudent.media_release_consent.text[3] }}
                                        </p>
                                        <ul class="list-disc ml-10 mb-3">
                                            <li v-for="(j, i) in newStudent.media_release_consent.list" :key="i"
                                                class="text-xs">
                                                {{ j }}
                                            </li>
                                        </ul>
                                        <p class="text-xs mb-3">
                                            {{ newStudent.media_release_consent.text[4] }}
                                        </p>
                                        <p class="text-xs mb-3">
                                            {{ newStudent.media_release_consent.text[5] }}
                                        </p>
                                        <p class="text-xs mb-3">
                                            {{ newStudent.media_release_consent.text[6] }}
                                        </p>
                                        <p class="text-xs mb-3">
                                            {{ newStudent.media_release_consent.text[7] }}
                                        </p>
                                        <p class="text-xs mb-3">
                                            {{ newStudent.media_release_consent.text[8] }}
                                        </p>
                                        <p class="text-xs mb-3">
                                            {{ newStudent.media_release_consent.text[9] }}
                                        </p>
                                        <p class="text-xs mb-4 text-green-800">
                                            {{ newStudent.media_release_consent.text[10] }}
                                        </p>
                                        <div class="">
                                            <div class="my-3 flex items-center">
                                                <input type="radio" class="mr-1.5"
                                                    v-model="newStudent.media_release_consent.answer" value="AGREE" />
                                                <label class="text-xs font-bold text-green-900">
                                                    AGREE
                                                </label>
                                            </div>
                                            <div class="flex items-center">
                                                <input type="radio" class="mr-1.5"
                                                    v-model="newStudent.media_release_consent.answer"
                                                    value="DO NOT AGREE" />
                                                <label class="text-xs font-bold text-green-900">
                                                    DO NOT AGREE
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="shadow lg:px-10 px-3 py-5 text-green-900">
                                        <h2 class="font-bold capitalize text-green-900">CERTIFICATION</h2>
                                        <p class="text-xs font-bold text-green-900">
                                            {{ newStudent.hereby_certification.text[0] }}
                                        </p>
                                        <p class="text-xs mb-3">
                                            {{ newStudent.hereby_certification.text[1] }}
                                        </p>
                                        <div class="my-3 flex items-center">
                                            <input type="checkbox" class="mr-2"
                                                v-model="newStudent.hereby_certification.answer" value="" />
                                            <label class="text-xs font-bold">
                                                {{ newStudent.hereby_certification.text[2] }}
                                            </label>
                                        </div>
                                    </div>
                                    <div class="lg:flex py-5 border-t-4 border-green-800 justify-between">
                                        <div class="flex items-center lg:mb-0 mb-20">
                                            <div @click="toggleInfo(
                                                false, false, false, false, true, false)"
                                                class="flex items-center cursor-pointer py-1 uppercase px-4 shadow bg-green-800 text-white hover:bg-white hover:text-green-800 rounded-lg mx-2 w-fit">
                                                <i class="fa fa-angle-double-left pr-2 py-1"></i> Review
                                            </div>
                                            <div class="lg:w-full w-10/12">
                                                <p class="text-green-800 lg:text-sm text-xs text-left">
                                                    Please check all your information before submitting ...
                                                </p>
                                            </div>
                                        </div>
                                        <div class="text-right">
                                            <button type="submit"
                                                class="cursor-pointer py-1 uppercase px-4 shadow bg-green-800 text-white hover:bg-white hover:text-green-800 rounded-lg mx-2">
                                                Submit <i class="fa fa-paper-plane pl-2"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="submitAndCheckEmailTab" class="lg:my-0 my-5">
                <div class="lg:px-10 px-4">
                    <div
                        class="lg:flex gap-10 rounded-4xl bg-white lg:px-14 px-3 py-1 lg:w-6/12 mx-auto lg:my-5 shadow-sm rounded-xl">
                        <div class="flex items-center">
                            <img src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/icons/check-mark-icon-isolated-on-white-background-vector-26464923.jpg"
                                class="lg:w-44 w-20 mx-auto lg:mt-0 mt-14" />
                        </div>
                        <div class="text-xl text-green-900 text-center lg:py-20 py-5 lg:w-8/12 mx-auto">
                            <h1 class="font-bold text-3xl mb-10">Congratulations! </h1>
                            <p class="font-light text-xs mb-10">This page confirms that your application for admission
                                to La Salle University has been submitted.
                                Please check your email to receive your tracking ID number in order to monitor the
                                progress of your enrollment online in real time.</p>
                            <a href="https://lsu.edu.ph/enrollment"
                                class="bg-green-800 text-white rounded-3xl py-1.5 px-5 lg:mb-0 mb-5 mx-auto block w-fit capitalize text-xs">
                                Back to Main Page</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <Footer />
</div>
</template>

<style scoped>
.bg-green-10 {
    background: #003613;
}

select {
    color: #000000;
}

option:not(:first-of-type) {
    color: black;
}
</style>