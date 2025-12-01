<script setup>
import { useUserStore } from "@/stores/user";
const userStore = useUserStore();
const endpoint = ref(userStore.mainDevServer);
import axios from "axios";
import { onMounted } from "vue";

const route = useRoute();
const evaluationFormTab = ref(true)
const doneEvaluationFormTab = ref(false)
const spinner = ref(false);
let enrolleesData = ref();
const searchBtn = ref();

onMounted(async () => {
    // let enrollees = await axios.get(endpoint.value + "/api/admissions/list/")
    // enrolleesData.value = enrollees.data
    // console.log(enrollees.data)
})

const evaluationStatic = ref({
    header_title: [
        'CLIENT FEEDBACK',
        'Online Enrollment Procedures',
        'We value your feedback!',
        'Please help us understand how we can best serve you during the online enrollment.',
        'Together, let us foster productive and respectful conversations.'
    ],
    heading: {
        question: 'Check out the continuum below and assess your level of satisfaction during the online enrollment process in terms of:',
        score: [
            {
                number: 5,
                text: 'Completely Satisfied'
            },
            {
                number: 4,
                text: 'Very Satisfied'
            },
            {
                number: 3,
                text: 'Moderately Satisfied'
            },
            {
                number: 2,
                text: 'Slightly Satisfied'
            },
            {
                number: 1,
                text: 'Not at all Satisfied'
            },
            {
                number: 0,
                text: 'Not Applicable'
            }
        ]
    }
})

let evaluationData = ref({
    tracking_id: '',
    firstname: '-',
    middlename: '-',
    lastname: '-',
    student_lsu_id_number: '-',
    lsu_email_address: '',
    personal_email_address: '',
    evaluation_form: {
        main_question: [
            {
                question_heading: 'I - ENROLLMENT PROCEDURES',
                question_list: [
                    {
                        question: 'Facilitation of assessment test, guiding you on what program to take, interview for shiftees, etc. at the Career & Counseling Center.',
                        score: [
                            {
                                number: 5,
                                text: 'Completely Satisfied'
                            },
                            {
                                number: 4,
                                text: 'Very Satisfied'
                            },
                            {
                                number: 3,
                                text: 'Moderately Satisfied'
                            },
                            {
                                number: 2,
                                text: 'Slightly Satisfied'
                            },
                            {
                                number: 1,
                                text: 'Not at all Satisfied'
                            },
                            {
                                number: 0,
                                text: 'Not Applicable'
                            }
                        ],
                        answer: '',
                    },
                    {
                        question: 'Submission of requirements, interview for data verification and facilitation of other matters (e.g. assessment test, promissory note application, career re-assessment interview for shiftees, etc.).',
                        score: [
                            {
                                number: 5,
                                text: 'Completely Satisfied'
                            },
                            {
                                number: 4,
                                text: 'Very Satisfied'
                            },
                            {
                                number: 3,
                                text: 'Moderately Satisfied'
                            },
                            {
                                number: 2,
                                text: 'Slightly Satisfied'
                            },
                            {
                                number: 1,
                                text: 'Not at all Satisfied'
                            },
                            {
                                number: 0,
                                text: 'Not Applicable'
                            }
                        ],
                        answer: '',
                    },
                    {
                        question: 'Payment process at the Finance & Accounting Services Office',
                        score: [
                            {
                                number: 5,
                                text: 'Completely Satisfied'
                            },
                            {
                                number: 4,
                                text: 'Very Satisfied'
                            },
                            {
                                number: 3,
                                text: 'Moderately Satisfied'
                            },
                            {
                                number: 2,
                                text: 'Slightly Satisfied'
                            },
                            {
                                number: 1,
                                text: 'Not at all Satisfied'
                            },
                            {
                                number: 0,
                                text: 'Not Applicable'
                            }
                        ],
                        answer: '',
                    },
                    {
                        question: 'Advising and approving of course load at your respective college.',
                        score: [
                            {
                                number: 5,
                                text: 'Completely Satisfied'
                            },
                            {
                                number: 4,
                                text: 'Very Satisfied'
                            },
                            {
                                number: 3,
                                text: 'Moderately Satisfied'
                            },
                            {
                                number: 2,
                                text: 'Slightly Satisfied'
                            },
                            {
                                number: 1,
                                text: 'Not at all Satisfied'
                            },
                            {
                                number: 0,
                                text: 'Not Applicable'
                            }
                        ],
                        answer: '',
                    },
                    {
                        question: 'Activation of online credentials and issuance of ID and COR.',
                        score: [
                            {
                                number: 5,
                                text: 'Completely Satisfied'
                            },
                            {
                                number: 4,
                                text: 'Very Satisfied'
                            },
                            {
                                number: 3,
                                text: 'Moderately Satisfied'
                            },
                            {
                                number: 2,
                                text: 'Slightly Satisfied'
                            },
                            {
                                number: 1,
                                text: 'Not at all Satisfied'
                            },
                            {
                                number: 0,
                                text: 'Not Applicable'
                            }
                        ],
                        answer: '',
                    },
                    {
                        question: 'In general, how satisfied are you with the enrollment procedures?',
                        score: [
                            {
                                number: 5,
                                text: 'Completely Satisfied'
                            },
                            {
                                number: 4,
                                text: 'Very Satisfied'
                            },
                            {
                                number: 3,
                                text: 'Moderately Satisfied'
                            },
                            {
                                number: 2,
                                text: 'Slightly Satisfied'
                            },
                            {
                                number: 1,
                                text: 'Not at all Satisfied'
                            },
                            {
                                number: 0,
                                text: 'Not Applicable'
                            }
                        ],
                        answer: '',
                    }
                ],
            },
            {
                question_heading: 'II - ONLINE ENROLLMENT SYSTEM',
                question_list: [
                    {
                        question: 'User friendliness of the system.',
                        score: [
                            {
                                number: 5,
                                text: 'Completely Satisfied'
                            },
                            {
                                number: 4,
                                text: 'Very Satisfied'
                            },
                            {
                                number: 3,
                                text: 'Moderately Satisfied'
                            },
                            {
                                number: 2,
                                text: 'Slightly Satisfied'
                            },
                            {
                                number: 1,
                                text: 'Not at all Satisfied'
                            },
                            {
                                number: 0,
                                text: 'Not Applicable'
                            }
                        ],
                        answer: '',
                    },
                    {
                        question: 'Organization of information on the screen.',
                        score: [
                            {
                                number: 5,
                                text: 'Completely Satisfied'
                            },
                            {
                                number: 4,
                                text: 'Very Satisfied'
                            },
                            {
                                number: 3,
                                text: 'Moderately Satisfied'
                            },
                            {
                                number: 2,
                                text: 'Slightly Satisfied'
                            },
                            {
                                number: 1,
                                text: 'Not at all Satisfied'
                            },
                            {
                                number: 0,
                                text: 'Not Applicable'
                            }
                        ],
                        answer: '',
                    },
                    {
                        question: 'Features of the system.',
                        score: [
                            {
                                number: 5,
                                text: 'Completely Satisfied'
                            },
                            {
                                number: 4,
                                text: 'Very Satisfied'
                            },
                            {
                                number: 3,
                                text: 'Moderately Satisfied'
                            },
                            {
                                number: 2,
                                text: 'Slightly Satisfied'
                            },
                            {
                                number: 1,
                                text: 'Not at all Satisfied'
                            },
                            {
                                number: 0,
                                text: 'Not Applicable'
                            }
                        ],
                        answer: '',
                    },
                    {
                        question: 'Reading characters on the screen and prompts for inputs are clear.',
                        score: [
                            {
                                number: 5,
                                text: 'Completely Satisfied'
                            },
                            {
                                number: 4,
                                text: 'Very Satisfied'
                            },
                            {
                                number: 3,
                                text: 'Moderately Satisfied'
                            },
                            {
                                number: 2,
                                text: 'Slightly Satisfied'
                            },
                            {
                                number: 1,
                                text: 'Not at all Satisfied'
                            },
                            {
                                number: 0,
                                text: 'Not Applicable'
                            }
                        ],
                        answer: '',
                    },
                    {
                        question: 'Use of terms throughout the system is consistent.',
                        score: [
                            {
                                number: 5,
                                text: 'Completely Satisfied'
                            },
                            {
                                number: 4,
                                text: 'Very Satisfied'
                            },
                            {
                                number: 3,
                                text: 'Moderately Satisfied'
                            },
                            {
                                number: 2,
                                text: 'Slightly Satisfied'
                            },
                            {
                                number: 1,
                                text: 'Not at all Satisfied'
                            },
                            {
                                number: 0,
                                text: 'Not Applicable'
                            }
                        ],
                        answer: '',
                    },
                    {
                        question: 'System always informs about the progress of the task.',
                        score: [
                            {
                                number: 5,
                                text: 'Completely Satisfied'
                            },
                            {
                                number: 4,
                                text: 'Very Satisfied'
                            },
                            {
                                number: 3,
                                text: 'Moderately Satisfied'
                            },
                            {
                                number: 2,
                                text: 'Slightly Satisfied'
                            },
                            {
                                number: 1,
                                text: 'Not at all Satisfied'
                            },
                            {
                                number: 0,
                                text: 'Not Applicable'
                            }
                        ],
                        answer: '',
                    },
                    {
                        question: 'Client support availablity.',
                        score: [
                            {
                                number: 5,
                                text: 'Completely Satisfied'
                            },
                            {
                                number: 4,
                                text: 'Very Satisfied'
                            },
                            {
                                number: 3,
                                text: 'Moderately Satisfied'
                            },
                            {
                                number: 2,
                                text: 'Slightly Satisfied'
                            },
                            {
                                number: 1,
                                text: 'Not at all Satisfied'
                            },
                            {
                                number: 0,
                                text: 'Not Applicable'
                            }
                        ],
                        answer: '',
                    },
                    {
                        question: 'In general, how satisfied are you with the online enrollment system?',
                        score: [
                            {
                                number: 5,
                                text: 'Completely Satisfied'
                            },
                            {
                                number: 4,
                                text: 'Very Satisfied'
                            },
                            {
                                number: 3,
                                text: 'Moderately Satisfied'
                            },
                            {
                                number: 2,
                                text: 'Slightly Satisfied'
                            },
                            {
                                number: 1,
                                text: 'Not at all Satisfied'
                            },
                            {
                                number: 0,
                                text: 'Not Applicable'
                            }
                        ],
                        answer: '',
                    }
                ],
            }
        ],
        sub_question: [
            {
                question: 'What challenges have you faced while using the online enrollment system?',
                answer: '',
            },
            {
                question: 'What improvements or additional features would you like to see in the online enrollment system in the future?',
                answer: '',
            }
        ]
    }
})

const fillOutInfo = async () => {
    // console.log("enrolleesData.value", enrolleesData.value)
    // enrolleesData.value.filter(function (params) {
        // if (searchBtn.value === params.tracking_id) {
        //     console.log(params)
        //     evaluationData.value.tracking_id = params.tracking_id,
        //     evaluationData.value.firstname = params.student_personal_info.firstname,
        //     evaluationData.value.middlename = params.student_personal_info.middlename,
        //     evaluationData.value.lastname = params.student_personal_info.lastname,
        //     evaluationData.value.student_lsu_id_number = params.student_lsu_id_number,
        //     evaluationData.value.lsu_email_address = params.student_contact_info.contact.lsu_email_address,
        //     evaluationData.value.personal_email_address = params.student_contact_info.contact.personal_email_address
        // }
    // })
    // singleData.evaluation.submitted = true
}

// musta have ID
// const editStatus = async () => {
//     await $fetch(endpoint.value + "/api/admissions/" + route.params.id + "/edit/", {
//         method: "PUT",
//         body: enrolleesData.value,
//     }).then((response) => {
//         console.log("response", response);
//     })
// }

const submitEvaluation = async () => {
    await $fetch(endpoint.value + "/api/admissions/submit-evaluation-form/create/",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: evaluationData.value,
        }
    ).then((response) => {
        // console.log(response);
        evaluationFormTab.value = false
        doneEvaluationFormTab.value = true
    })
}

const submitFunc = async () => {
    // fillOutInfo()
    // editStatus()
    // console.log('evaluationData', evaluationData)
    submitEvaluation()
}

</script>

<template>
<div>
    <Header />
    <div class="">
        <div class="">
            <div class="relative">
                <Banner />
                <img src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/green-tones-gradient-background_23-2148374436.png"
                    class="align-top w-full h-36 object-none lg:hidden block" />
                <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
                    <h1 class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto">
                        Enrollment Evaluation
                    </h1>
                </div>
                <div class="pt-2.5 pb-3 shadow-lg">
                    <ul class="flex lasalle-green-text capitalize w-11/12 mx-auto text-xs">
                        <li>
                            <a href="/" class="mr-1"> Home </a>
                        </li>
                        <li>
                            <i class="fas fa-caret-right mr-1"></i>
                            <a href="/enrollment" class="mr-1">
                                Enrollment
                            </a>
                        </li>
                        <li>
                            <i class="fas fa-caret-right mr-1"></i>
                            <a href="/enrollment/evaluation" class="mr-1">
                                Evaluation
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="w-11/12 mx-auto" v-if="evaluationFormTab">


            <div class="text-center lg:mt-10 mt-5">
                <h1 class="uppercase font-bold text-green-900 mb-3">
                    {{ evaluationStatic.header_title[0] }}
                </h1>
                <p class="text-center text-xs">
                    {{ evaluationStatic.header_title[1] }}
                </p>
                <p class="text-center text-xs mb-5">
                    {{ evaluationStatic.header_title[2] }}
                </p>
                <p class="lg:text-left text-xs lg:w-full w-10/12 mx-auto">
                    {{ evaluationStatic.header_title[3] }}
                </p>
                <p class="lg:text-left text-xs lg:w-full w-10/12 mx-auto mb-3">
                    {{ evaluationStatic.header_title[4] }}
                </p>
            </div>
            <form v-on:submit.prevent="submitFunc">
                <div>
                    <div class="border mb-10">
                        <div class="w-full">
                            <p class="font-bold text-white bg-green-900 py-1 px-2">
                                {{ evaluationData.evaluation_form.main_question[0].question_heading }}
                            </p>
                        </div>
                        <div class="w-full">
                            <div class="lg:flex gap-20 border-b-2 border-green-900 py-4">
                                <p class="lg:w-7/12 flex items-center font-bold text-sm px-3 lg:mb-0 mb-2">
                                    {{ evaluationStatic.heading.question }}
                                </p>
                                <ul class="w-full flex items-center">
                                    <li class="justify-center text-center w-full text-sm lg:pt-0 pt-2 lg:px-3 px-1"
                                        v-for="(j, i) in evaluationStatic.heading.score" :key="i">
                                        <span
                                            class="block text-white py-1 px-2.5 mb-2 font-bold w-fit mx-auto rounded-full bg-green-900 ">
                                            {{ j.number }}</span>
                                        <span
                                            class="justify-center w-full mx-auto lg:text-sm text-[8px] leading-tight font-semibold text-green-900 flex lg:h-10 h-6">
                                            {{ j.text }}</span>
                                    </li>
                                </ul>
                            </div>
                            <div class="shadow">
                                <ul>
                                    <li v-for="(j, i) in evaluationData.evaluation_form.main_question[0].question_list"
                                        :key="i" class="lg:flex items-center gap-20 border-b py-3">
                                        <p
                                            class="lg:w-7/12 flex items-center text-sm px-3 lg:border-none border-b-2 lg:pb-0 pb-3">
                                            <span
                                                class="font-bold text-white bg-green-900 px-2 text-xs rounded-full py-1 mr-3 w-fit h-fit">
                                                {{ i
                                                    + 1 }}</span>
                                            <span class="lg:text-sm text-xs">{{ j.question }}</span>
                                        </p>
                                        <ul class="flex items-center w-full lg:pt-0 pt-2">
                                            <li v-for="(m, l) in j.score" :key="l"
                                                class="text-sm justify-center text-center w-full">
                                                <span class="block lg:hidden text-xs text-green-900 font-bold">{{
                                                    m.number }}</span>
                                                <span class="block">
                                                    <input type="radio" v-model="j.answer" :value="m.text"
                                                        class="cursor-pointer" required />
                                                </span>
                                            </li>
                                        </ul>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="border">
                        <div class="w-full">
                            <p class="font-bold text-white bg-green-900 py-1 px-2">
                                {{ evaluationData.evaluation_form.main_question[1].question_heading }}
                            </p>
                        </div>
                        <div class="w-full">
                            <div class="lg:flex gap-20 border-b-2 border-green-900 py-4">
                                <p class="lg:w-7/12 flex items-center font-bold text-sm px-3 lg:mb-0 mb-2">
                                    {{ evaluationStatic.heading.question }}
                                </p>
                                <ul class="w-full flex items-center">
                                    <li class="justify-center text-center w-full text-sm lg:pt-0 pt-2 lg:px-3 px-1"
                                        v-for="(j, i) in evaluationStatic.heading.score" :key="i">
                                        <span
                                            class="block text-white py-1 px-2.5 mb-2 font-bold w-fit mx-auto rounded-full bg-green-900">{{
                                                j.number }}</span>
                                        <span
                                            class="justify-center w-full mx-auto lg:text-sm text-[8px] leading-tight font-semibold text-green-900 flex lg:h-10 h-6">
                                            {{ j.text }}</span>
                                    </li>
                                </ul>
                            </div>
                            <div class="shadow">
                                <ul>
                                    <li v-for="(j, i) in evaluationData.evaluation_form.main_question[1].question_list"
                                        :key="i" class="lg:flex items-center gap-20 border-b py-3">
                                        <p
                                            class="lg:w-7/12 flex items-center text-sm px-3 lg:border-none border-b-2 lg:pb-0 pb-3">
                                            <span
                                                class="font-bold text-white bg-green-900 px-2 text-xs rounded-full py-1 mr-3 w-fit h-fit">{{
                                                    i
                                                    + 1 }}</span>
                                            <span class="lg:text-sm text-xs">{{ j.question }}</span>
                                        </p>
                                        <ul class="flex items-center w-full lg:pt-0 pt-2">
                                            <li v-for="(m, l) in j.score" :key="l"
                                                class="text-sm justify-center text-center w-full">
                                                <span class="block lg:hidden text-xs text-green-900 font-bold">{{
                                                    m.number }}</span>
                                                <span class="block">
                                                    <input type="radio" v-model="j.answer" :value="m.text"
                                                        class="cursor-pointer" required />
                                                </span>
                                            </li>
                                        </ul>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="shadow border my-10 py-5 lg:px-3 px-2">
                        <ul class="lg:py-3">
                            <li v-for="(j, i) in evaluationData.evaluation_form.sub_question" :key="i"
                                :class="i === 0 ? 'lg:mb-7 mb-5' : ''">
                                <label
                                    class="text-green-900 lg:leading-normal leading-tight font-bold mb-2 block lg:w-8/12 lg:text-sm text-xs">{{
                                        j.question }}</label>
                                <!-- <input class="w-full px-2 py-1 border" v-model="j.answer"> -->
                                <textarea
                                    class="py-1 w-full lg:h-auto h-40 px-2 border-b-2 border-t border-t-gray-100 border-x-0 border-green-700 shadow-lg rounded-sm text-xs"
                                    id="answer" required name="answer" rows="1" v-model="j.answer" placeholder="answer here ...">
                                </textarea>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="flex justify-center items-center">
                    <div class="hidden">
                        <br>
                        {{ evaluationData.firstname }}
                        {{ evaluationData.middlename }}
                        {{ evaluationData.lastname }}
                        <br>
                        {{ evaluationData.student_lsu_id_number }}
                        <br>
                        {{ evaluationData.lsu_email_address }}
                        <br>
                        {{ evaluationData.personal_email_address }}
                        <br>
                        <!-- {{ enrollee.evaluation.submitted }} -->

                    </div>
                    <div class="mb-10 w-full">
                        <p class="text-green-800 text-sm text-center mb-4">All fields are required. Please ensure correct emails and tracking IDs are provided for us to match and update. Double-check the Tracking ID and Email before submitting. Thank you!</p>
                        <div class="lg:flex lg:w-10/12 mx-auto gap-10">
                            <input type="text"
                                class="w-full mb-3 lg:mb-0 uppercase border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                placeholder="Tracking ID" v-model="evaluationData.tracking_id" required />
                            <input type="text"
                                class="w-full mb-3 lg:mb-0 lowercase border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                placeholder="LSU Email" v-model="evaluationData.lsu_email_address" required />
                            <input type="text"
                                class="w-full mb-3 lg:mb-0 lowercase border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm h-9 text-xs"
                                placeholder="Personal Email" v-model="evaluationData.personal_email_address" required />
                        </div>
                    </div>
                </div>
                <div>
                    <button type="submit"
                        class="bg-green-800 hover:bg-white font-bold uppercase border-4 border-green-800 rounded-lg mx-auto block  mb-10 px-3 py-1 hover:text-green-800 text-white">
                        Submit
                    </button>
                </div>
            </form>
        </div>
        <div v-if="doneEvaluationFormTab" class="lg:my-10 my-5">
      <div class="lg:px-10 px-4">
        <div
          class="lg:flex gap-10 rounded-4xl bg-white lg:px-14 px-3 py-1 lg:w-6/12 mx-auto lg:my-5 shadow-sm rounded-xl">
          <div class="flex items-center">
            <img
              src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/icons/check-mark-icon-isolated-on-white-background-vector-26464923.jpg"
              class="lg:w-44 w-20 mx-auto lg:mt-0 mt-14" />
          </div>
          <div class="text-xl text-green-900 text-center lg:py-20 py-5 lg:w-8/12 mx-auto">
            <h1 class="font-bold text-3xl mb-10">Congratulations! </h1>
            <p class="font-light text-xs mb-10">Please Check your email and check the tracking page. Thank you and
              Welcome back to LSU!</p>
            <a href="https://lsu.edu.ph/enrollment"
              class="bg-green-800 text-white rounded-3xl py-1.5 px-5 lg:mb-0 mb-5 mx-auto block w-fit capitalize text-xs">
              Back to Main Page</a>
          </div>
        </div>
      </div>
    </div>
    </div>
    <Footer />
</div>
</template>

<style>
input[type='radio'] {
    color: #005715;
    outline: none;
    box-shadow: none;
}
</style>