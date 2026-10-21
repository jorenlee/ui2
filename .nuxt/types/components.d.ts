
import type { DefineComponent, SlotsType } from 'vue'
type IslandComponent<T> = DefineComponent<{}, {refresh: () => Promise<void>}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, SlotsType<{ fallback: { error: unknown } }>> & T

type HydrationStrategies = {
  hydrateOnVisible?: IntersectionObserverInit | true
  hydrateOnIdle?: number | true
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true
  hydrateOnMediaQuery?: string
  hydrateAfter?: number
  hydrateWhen?: boolean
  hydrateNever?: true
}
type LazyComponent<T> = DefineComponent<HydrationStrategies, {}, {}, {}, {}, {}, {}, { hydrated: () => void }> & T

interface _GlobalComponents {
  AboutSideMenu: typeof import("../../app/components/AboutSideMenu.vue")['default']
  AboutUs: typeof import("../../app/components/AboutUs.vue")['default']
  Activities: typeof import("../../app/components/Activities.vue")['default']
  Adsbygoogle: typeof import("../../app/components/Adsbygoogle.vue")['default']
  AnimoRunList: typeof import("../../app/components/AnimoRunList.vue")['default']
  AnimoRunRegistration: typeof import("../../app/components/AnimoRunRegistration.vue")['default']
  Banner: typeof import("../../app/components/Banner.vue")['default']
  BlogPosting: typeof import("../../app/components/BlogPosting.vue")['default']
  BorrowOfficesKey: typeof import("../../app/components/BorrowOfficesKey/index.vue")['default']
  Breadcrumb: typeof import("../../app/components/Breadcrumb.vue")['default']
  CMSForm: typeof import("../../app/components/CMS/Form.vue")['default']
  CMSList: typeof import("../../app/components/CMS/List.vue")['default']
  CampusPass: typeof import("../../app/components/CampusPass/index.vue")['default']
  CampusPassMenuBar: typeof import("../../app/components/CampusPassMenuBar.vue")['default']
  ChancellorOffice: typeof import("../../app/components/ChancellorOffice/index.vue")['default']
  ChancelorsUpdate: typeof import("../../app/components/ChancelorsUpdate.vue")['default']
  ComingSoon: typeof import("../../app/components/ComingSoon.vue")['default']
  CommissionOnElectionAddCandidates: typeof import("../../app/components/CommissionOnElection/AddCandidates.vue")['default']
  CommissionOnElectionListEnrolledStudents: typeof import("../../app/components/CommissionOnElection/ListEnrolledStudents.vue")['default']
  CommissionOnElectionStudentElectionResults: typeof import("../../app/components/CommissionOnElection/StudentElectionResults.vue")['default']
  CommissionOnElectionStudentElectionVoting: typeof import("../../app/components/CommissionOnElection/StudentElectionVoting.vue")['default']
  CommissionOnElectionBEUAddCandidates: typeof import("../../app/components/CommissionOnElectionBEU/AddCandidates.vue")['default']
  CommissionOnElectionBEUListEnrolledStudents: typeof import("../../app/components/CommissionOnElectionBEU/ListEnrolledStudents.vue")['default']
  CommissionOnElectionBEUStudentElectionResults: typeof import("../../app/components/CommissionOnElectionBEU/StudentElectionResults.vue")['default']
  CommissionOnElectionBEUStudentElectionVoting: typeof import("../../app/components/CommissionOnElectionBEU/StudentElectionVoting.vue")['default']
  Countdown: typeof import("../../app/components/Countdown.vue")['default']
  DashboardFooter: typeof import("../../app/components/DashboardFooter.vue")['default']
  DataProcessDPO: typeof import("../../app/components/DataProcessDPO/index.vue")['default']
  DocumentRequestForm: typeof import("../../app/components/DocumentRequestForm.vue")['default']
  DocumentReviewSystemForm: typeof import("../../app/components/DocumentReviewSystem/Form.vue")['default']
  DocumentReviewSystemList: typeof import("../../app/components/DocumentReviewSystem/List.vue")['default']
  DynamicSideMenu: typeof import("../../app/components/DynamicSideMenu/index.vue")['default']
  EnrollmentMenuBar: typeof import("../../app/components/EnrollmentMenuBar.vue")['default']
  FAQs: typeof import("../../app/components/FAQs/index.vue")['default']
  Footer: typeof import("../../app/components/Footer.vue")['default']
  FooterInvestiture: typeof import("../../app/components/FooterInvestiture.vue")['default']
  GSOFacilitiesReservationForm: typeof import("../../app/components/GSO/FacilitiesReservationForm.vue")['default']
  GSOFacilitiesReservationList: typeof import("../../app/components/GSO/FacilitiesReservationList.vue")['default']
  GSOFacilitySelector: typeof import("../../app/components/GSO/FacilitySelector.vue")['default']
  GSOVehicleReservationForm: typeof import("../../app/components/GSO/VehicleReservationForm.vue")['default']
  GSOVehicleReservationList: typeof import("../../app/components/GSO/VehicleReservationList.vue")['default']
  GSOVehicleSelector: typeof import("../../app/components/GSO/VehicleSelector.vue")['default']
  GoogleAdsense: typeof import("../../app/components/GoogleAdsense/index.vue")['default']
  GoogleDriveEmbed: typeof import("../../app/components/GoogleDriveEmbed/index.vue")['default']
  Header: typeof import("../../app/components/Header.vue")['default']
  HeroCarousel: typeof import("../../app/components/HeroCarousel.vue")['default']
  HeroLanding: typeof import("../../app/components/HeroLanding.vue")['default']
  HumanResourceEmployedAdmins: typeof import("../../app/components/HumanResource/EmployedAdmins.vue")['default']
  HumanResource: typeof import("../../app/components/HumanResource/index.vue")['default']
  HumanResourceRaffle: typeof import("../../app/components/HumanResource/raffle.vue")['default']
  ITFeedback: typeof import("../../app/components/ITFeedback/index.vue")['default']
  InvestitureDonationBox: typeof import("../../app/components/InvestitureDonationBox.vue")['default']
  JurisDoctorAdmin: typeof import("../../app/components/JurisDoctor/Admin.vue")['default']
  JurisDoctorAdmission: typeof import("../../app/components/JurisDoctor/Admission.vue")['default']
  LibraryElectronicResources: typeof import("../../app/components/Library/ElectronicResources.vue")['default']
  LibraryBooks: typeof import("../../app/components/Library/books/index.vue")['default']
  LibraryReserved: typeof import("../../app/components/Library/reserved/index.vue")['default']
  LibrarySchedules: typeof import("../../app/components/Library/schedules/index.vue")['default']
  LibrarySchedulesUseSchedules: typeof import("../../app/components/Library/schedules/useSchedules")['default']
  LibrarySchedulesWorking: typeof import("../../app/components/Library/schedules/working.vue")['default']
  LibraryMenuBar: typeof import("../../app/components/LibraryMenuBar.vue")['default']
  LibraryMenuBarBorrower: typeof import("../../app/components/LibraryMenuBarBorrower.vue")['default']
  Logout: typeof import("../../app/components/Logout.vue")['default']
  McoMenuBar: typeof import("../../app/components/McoMenuBar.vue")['default']
  MoodTicket: typeof import("../../app/components/MoodTicket.vue")['default']
  MyAnimoRunMyRuns: typeof import("../../app/components/MyAnimoRun/MyRuns.vue")['default']
  NPCC: typeof import("../../app/components/NPCC/index.vue")['default']
  NetworkLogo: typeof import("../../app/components/NetworkLogo.vue")['default']
  NewsAndUpdates: typeof import("../../app/components/NewsAndUpdates.vue")['default']
  OERForm: typeof import("../../app/components/OER/Form.vue")['default']
  OERList: typeof import("../../app/components/OER/List.vue")['default']
  Pagination: typeof import("../../app/components/Pagination.vue")['default']
  Panaglambigit: typeof import("../../app/components/Panaglambigit.vue")['default']
  PopularCourses: typeof import("../../app/components/PopularCourses.vue")['default']
  ProcurementFooter: typeof import("../../app/components/ProcurementFooter.vue")['default']
  ProcurementMenuBar: typeof import("../../app/components/ProcurementMenuBar.vue")['default']
  RegistrarChatCommunicationModal: typeof import("../../app/components/Registrar/ChatCommunicationModal.vue")['default']
  RegistrarDeleteConfirmationModal: typeof import("../../app/components/Registrar/DeleteConfirmationModal.vue")['default']
  RegistrarDocumentPreparationModal: typeof import("../../app/components/Registrar/DocumentPreparationModal.vue")['default']
  RegistrarFilters: typeof import("../../app/components/Registrar/Filters.vue")['default']
  RegistrarList: typeof import("../../app/components/Registrar/List.vue")['default']
  RegistrarPagination: typeof import("../../app/components/Registrar/Pagination.vue")['default']
  RegistrarPaymentDetailsModal: typeof import("../../app/components/Registrar/PaymentDetailsModal.vue")['default']
  RegistrarPersonalInfoModal: typeof import("../../app/components/Registrar/PersonalInfoModal.vue")['default']
  RegistrarReleasingDocumentsModal: typeof import("../../app/components/Registrar/ReleasingDocumentsModal.vue")['default']
  RegistrarShowImageModal: typeof import("../../app/components/Registrar/ShowImageModal.vue")['default']
  RegistrarStatusCounters: typeof import("../../app/components/Registrar/StatusCounters.vue")['default']
  RegistrarStatusLogsModal: typeof import("../../app/components/Registrar/StatusLogsModal.vue")['default']
  RegistrarTransactionClosedModal: typeof import("../../app/components/Registrar/TransactionClosedModal.vue")['default']
  RegistrarVerifyErrorMessageToaster: typeof import("../../app/components/Registrar/VerifyErrorMessageToaster.vue")['default']
  RegistrarVerifySuccessMessageToaster: typeof import("../../app/components/Registrar/VerifySuccessMessageToaster.vue")['default']
  Registrar: typeof import("../../app/components/Registrar/index.vue")['default']
  RegistrarMenuBar: typeof import("../../app/components/RegistrarMenuBar.vue")['default']
  RegistrarPrivacyPolicy: typeof import("../../app/components/RegistrarPrivacyPolicy.vue")['default']
  SDG: typeof import("../../app/components/SDG.vue")['default']
  Shortcuts: typeof import("../../app/components/Shortcuts.vue")['default']
  Slider: typeof import("../../app/components/Slider.vue")['default']
  SliderAlt: typeof import("../../app/components/SliderAlt.vue")['default']
  SliderInvestiture: typeof import("../../app/components/SliderInvestiture.vue")['default']
  Slides: typeof import("../../app/components/Slides.vue")['default']
  StudentBlog: typeof import("../../app/components/StudentBlog.vue")['default']
  Students: typeof import("../../app/components/Students.vue")['default']
  SuperAdminDashboard: typeof import("../../app/components/SuperAdminDashboard.vue")['default']
  SuperAdminDashboardExternalLinks: typeof import("../../app/components/SuperAdminDashboardExternalLinks.vue")['default']
  SuperAdminDashboardLoading: typeof import("../../app/components/SuperAdminDashboardLoading.vue")['default']
  SuperAdminDashboardMenuList: typeof import("../../app/components/SuperAdminDashboardMenuList.vue")['default']
  SuperAdminDashboardNavigation: typeof import("../../app/components/SuperAdminDashboardNavigation.vue")['default']
  SuperAdminDashboardProfile: typeof import("../../app/components/SuperAdminDashboardProfile.vue")['default']
  SuperAdminDashboardRolePermissions: typeof import("../../app/components/SuperAdminDashboardRolePermissions.vue")['default']
  SuperAdminDashboardWelcome: typeof import("../../app/components/SuperAdminDashboardWelcome.vue")['default']
  TUKIB: typeof import("../../app/components/TUKIB.vue")['default']
  Testimonials: typeof import("../../app/components/Testimonials.vue")['default']
  ThankYouNotifFromFormSubmit: typeof import("../../app/components/ThankYouNotifFromFormSubmit.vue")['default']
  TingogMagazine: typeof import("../../app/components/TingogMagazine.vue")['default']
  ToggleDarkLightMode: typeof import("../../app/components/ToggleDarkLightMode.vue")['default']
  TotalAmount: typeof import("../../app/components/TotalAmount.vue")['default']
  TotalDonationNumberOnly: typeof import("../../app/components/TotalDonationNumberOnly.vue")['default']
  UniversityCalendar: typeof import("../../app/components/UniversityCalendar.vue")['default']
  UniversityDashboard: typeof import("../../app/components/UniversityDashboard.vue")['default']
  UniversityFeedbackWidget: typeof import("../../app/components/UniversityFeedbackWidget.vue")['default']
  UniversityLogin: typeof import("../../app/components/UniversityLogin.vue")['default']
  UpdatingPage: typeof import("../../app/components/UpdatingPage.vue")['default']
  Waves: typeof import("../../app/components/Waves.vue")['default']
  /**
   * Displays the welcome screen used by new Nuxt projects.
   *
   * @see https://nuxt.com/docs/4.x/api/components/nuxt-welcome
   */
  NuxtWelcome: typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/app/components/welcome.vue")['default']
  /**
   * Renders the selected layout around pages or error content.
   *
   * @see https://nuxt.com/docs/4.x/api/components/nuxt-layout
   */
  NuxtLayout: typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/app/components/nuxt-layout")['default']
  /**
   * Catches client-side errors from its default slot and renders an error slot.
   *
   * @see https://nuxt.com/docs/4.x/api/components/nuxt-error-boundary
   */
  NuxtErrorBoundary: typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
  /**
   * Renders its default slot only on the client, with an optional server fallback.
   *
   * @see https://nuxt.com/docs/4.x/api/components/client-only
   */
  ClientOnly: typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/app/components/client-only")['default']
  /**
   * Renders its content only during development.
   *
   * @see https://nuxt.com/docs/4.x/api/components/dev-only
   */
  DevOnly: typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/app/components/dev-only")['default']
  ServerPlaceholder: typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/app/components/server-placeholder")['default']
  /**
   * A drop-in replacement for Vue Router's `<RouterLink>` and the HTML `<a>` element.
   *
   * @see https://nuxt.com/docs/4.x/api/components/nuxt-link
   */
  NuxtLink: typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/app/components/nuxt-link")['default']
  /**
   * Displays a progress bar during page navigation.
   *
   * @see https://nuxt.com/docs/4.x/api/components/nuxt-loading-indicator
   */
  NuxtLoadingIndicator: typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
  /**
   * Formats dates and times consistently across server and client using the user's locale.
   *
   * @see https://nuxt.com/docs/4.x/api/components/nuxt-time
   */
  NuxtTime: typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
  /**
   * Announces route changes to assistive technologies using the current page title.
   *
   * @see https://nuxt.com/docs/4.x/api/components/nuxt-route-announcer
   */
  NuxtRouteAnnouncer: typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
  /**
   * Announces dynamic content changes to assistive technologies.
   *
   * @see https://nuxt.com/docs/4.x/api/components/nuxt-announcer
   */
  NuxtAnnouncer: typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/app/components/nuxt-announcer")['default']
  /**
   * Renders an optimized image through the Nuxt Image module.
   *
   * @see https://nuxt.com/docs/4.x/api/components/nuxt-img
   */
  NuxtImg: typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
  /**
   * Renders responsive optimized images through the Nuxt Image module.
   *
   * @see https://nuxt.com/docs/4.x/api/components/nuxt-picture
   */
  NuxtPicture: typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
  /**
   * Renders the current page from the `pages/` directory.
   *
   * @see https://nuxt.com/docs/4.x/api/components/nuxt-page
   */
  NuxtPage: typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/pages/runtime/page")['default']
  NoScript: typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/head/runtime/components")['NoScript']
  Link: typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/head/runtime/components")['Link']
  Base: typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/head/runtime/components")['Base']
  Title: typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/head/runtime/components")['Title']
  Meta: typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/head/runtime/components")['Meta']
  Style: typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/head/runtime/components")['Style']
  Head: typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/head/runtime/components")['Head']
  Html: typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/head/runtime/components")['Html']
  Body: typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/head/runtime/components")['Body']
  /**
   * Renders a non-interactive server component without shipping client-side JavaScript.
   *
   * @see https://nuxt.com/docs/4.x/api/components/nuxt-island
   */
  NuxtIsland: typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/app/components/nuxt-island")['default']
  LazyAboutSideMenu: LazyComponent<typeof import("../../app/components/AboutSideMenu.vue")['default']>
  LazyAboutUs: LazyComponent<typeof import("../../app/components/AboutUs.vue")['default']>
  LazyActivities: LazyComponent<typeof import("../../app/components/Activities.vue")['default']>
  LazyAdsbygoogle: LazyComponent<typeof import("../../app/components/Adsbygoogle.vue")['default']>
  LazyAnimoRunList: LazyComponent<typeof import("../../app/components/AnimoRunList.vue")['default']>
  LazyAnimoRunRegistration: LazyComponent<typeof import("../../app/components/AnimoRunRegistration.vue")['default']>
  LazyBanner: LazyComponent<typeof import("../../app/components/Banner.vue")['default']>
  LazyBlogPosting: LazyComponent<typeof import("../../app/components/BlogPosting.vue")['default']>
  LazyBorrowOfficesKey: LazyComponent<typeof import("../../app/components/BorrowOfficesKey/index.vue")['default']>
  LazyBreadcrumb: LazyComponent<typeof import("../../app/components/Breadcrumb.vue")['default']>
  LazyCMSForm: LazyComponent<typeof import("../../app/components/CMS/Form.vue")['default']>
  LazyCMSList: LazyComponent<typeof import("../../app/components/CMS/List.vue")['default']>
  LazyCampusPass: LazyComponent<typeof import("../../app/components/CampusPass/index.vue")['default']>
  LazyCampusPassMenuBar: LazyComponent<typeof import("../../app/components/CampusPassMenuBar.vue")['default']>
  LazyChancellorOffice: LazyComponent<typeof import("../../app/components/ChancellorOffice/index.vue")['default']>
  LazyChancelorsUpdate: LazyComponent<typeof import("../../app/components/ChancelorsUpdate.vue")['default']>
  LazyComingSoon: LazyComponent<typeof import("../../app/components/ComingSoon.vue")['default']>
  LazyCommissionOnElectionAddCandidates: LazyComponent<typeof import("../../app/components/CommissionOnElection/AddCandidates.vue")['default']>
  LazyCommissionOnElectionListEnrolledStudents: LazyComponent<typeof import("../../app/components/CommissionOnElection/ListEnrolledStudents.vue")['default']>
  LazyCommissionOnElectionStudentElectionResults: LazyComponent<typeof import("../../app/components/CommissionOnElection/StudentElectionResults.vue")['default']>
  LazyCommissionOnElectionStudentElectionVoting: LazyComponent<typeof import("../../app/components/CommissionOnElection/StudentElectionVoting.vue")['default']>
  LazyCommissionOnElectionBEUAddCandidates: LazyComponent<typeof import("../../app/components/CommissionOnElectionBEU/AddCandidates.vue")['default']>
  LazyCommissionOnElectionBEUListEnrolledStudents: LazyComponent<typeof import("../../app/components/CommissionOnElectionBEU/ListEnrolledStudents.vue")['default']>
  LazyCommissionOnElectionBEUStudentElectionResults: LazyComponent<typeof import("../../app/components/CommissionOnElectionBEU/StudentElectionResults.vue")['default']>
  LazyCommissionOnElectionBEUStudentElectionVoting: LazyComponent<typeof import("../../app/components/CommissionOnElectionBEU/StudentElectionVoting.vue")['default']>
  LazyCountdown: LazyComponent<typeof import("../../app/components/Countdown.vue")['default']>
  LazyDashboardFooter: LazyComponent<typeof import("../../app/components/DashboardFooter.vue")['default']>
  LazyDataProcessDPO: LazyComponent<typeof import("../../app/components/DataProcessDPO/index.vue")['default']>
  LazyDocumentRequestForm: LazyComponent<typeof import("../../app/components/DocumentRequestForm.vue")['default']>
  LazyDocumentReviewSystemForm: LazyComponent<typeof import("../../app/components/DocumentReviewSystem/Form.vue")['default']>
  LazyDocumentReviewSystemList: LazyComponent<typeof import("../../app/components/DocumentReviewSystem/List.vue")['default']>
  LazyDynamicSideMenu: LazyComponent<typeof import("../../app/components/DynamicSideMenu/index.vue")['default']>
  LazyEnrollmentMenuBar: LazyComponent<typeof import("../../app/components/EnrollmentMenuBar.vue")['default']>
  LazyFAQs: LazyComponent<typeof import("../../app/components/FAQs/index.vue")['default']>
  LazyFooter: LazyComponent<typeof import("../../app/components/Footer.vue")['default']>
  LazyFooterInvestiture: LazyComponent<typeof import("../../app/components/FooterInvestiture.vue")['default']>
  LazyGSOFacilitiesReservationForm: LazyComponent<typeof import("../../app/components/GSO/FacilitiesReservationForm.vue")['default']>
  LazyGSOFacilitiesReservationList: LazyComponent<typeof import("../../app/components/GSO/FacilitiesReservationList.vue")['default']>
  LazyGSOFacilitySelector: LazyComponent<typeof import("../../app/components/GSO/FacilitySelector.vue")['default']>
  LazyGSOVehicleReservationForm: LazyComponent<typeof import("../../app/components/GSO/VehicleReservationForm.vue")['default']>
  LazyGSOVehicleReservationList: LazyComponent<typeof import("../../app/components/GSO/VehicleReservationList.vue")['default']>
  LazyGSOVehicleSelector: LazyComponent<typeof import("../../app/components/GSO/VehicleSelector.vue")['default']>
  LazyGoogleAdsense: LazyComponent<typeof import("../../app/components/GoogleAdsense/index.vue")['default']>
  LazyGoogleDriveEmbed: LazyComponent<typeof import("../../app/components/GoogleDriveEmbed/index.vue")['default']>
  LazyHeader: LazyComponent<typeof import("../../app/components/Header.vue")['default']>
  LazyHeroCarousel: LazyComponent<typeof import("../../app/components/HeroCarousel.vue")['default']>
  LazyHeroLanding: LazyComponent<typeof import("../../app/components/HeroLanding.vue")['default']>
  LazyHumanResourceEmployedAdmins: LazyComponent<typeof import("../../app/components/HumanResource/EmployedAdmins.vue")['default']>
  LazyHumanResource: LazyComponent<typeof import("../../app/components/HumanResource/index.vue")['default']>
  LazyHumanResourceRaffle: LazyComponent<typeof import("../../app/components/HumanResource/raffle.vue")['default']>
  LazyITFeedback: LazyComponent<typeof import("../../app/components/ITFeedback/index.vue")['default']>
  LazyInvestitureDonationBox: LazyComponent<typeof import("../../app/components/InvestitureDonationBox.vue")['default']>
  LazyJurisDoctorAdmin: LazyComponent<typeof import("../../app/components/JurisDoctor/Admin.vue")['default']>
  LazyJurisDoctorAdmission: LazyComponent<typeof import("../../app/components/JurisDoctor/Admission.vue")['default']>
  LazyLibraryElectronicResources: LazyComponent<typeof import("../../app/components/Library/ElectronicResources.vue")['default']>
  LazyLibraryBooks: LazyComponent<typeof import("../../app/components/Library/books/index.vue")['default']>
  LazyLibraryReserved: LazyComponent<typeof import("../../app/components/Library/reserved/index.vue")['default']>
  LazyLibrarySchedules: LazyComponent<typeof import("../../app/components/Library/schedules/index.vue")['default']>
  LazyLibrarySchedulesUseSchedules: LazyComponent<typeof import("../../app/components/Library/schedules/useSchedules")['default']>
  LazyLibrarySchedulesWorking: LazyComponent<typeof import("../../app/components/Library/schedules/working.vue")['default']>
  LazyLibraryMenuBar: LazyComponent<typeof import("../../app/components/LibraryMenuBar.vue")['default']>
  LazyLibraryMenuBarBorrower: LazyComponent<typeof import("../../app/components/LibraryMenuBarBorrower.vue")['default']>
  LazyLogout: LazyComponent<typeof import("../../app/components/Logout.vue")['default']>
  LazyMcoMenuBar: LazyComponent<typeof import("../../app/components/McoMenuBar.vue")['default']>
  LazyMoodTicket: LazyComponent<typeof import("../../app/components/MoodTicket.vue")['default']>
  LazyMyAnimoRunMyRuns: LazyComponent<typeof import("../../app/components/MyAnimoRun/MyRuns.vue")['default']>
  LazyNPCC: LazyComponent<typeof import("../../app/components/NPCC/index.vue")['default']>
  LazyNetworkLogo: LazyComponent<typeof import("../../app/components/NetworkLogo.vue")['default']>
  LazyNewsAndUpdates: LazyComponent<typeof import("../../app/components/NewsAndUpdates.vue")['default']>
  LazyOERForm: LazyComponent<typeof import("../../app/components/OER/Form.vue")['default']>
  LazyOERList: LazyComponent<typeof import("../../app/components/OER/List.vue")['default']>
  LazyPagination: LazyComponent<typeof import("../../app/components/Pagination.vue")['default']>
  LazyPanaglambigit: LazyComponent<typeof import("../../app/components/Panaglambigit.vue")['default']>
  LazyPopularCourses: LazyComponent<typeof import("../../app/components/PopularCourses.vue")['default']>
  LazyProcurementFooter: LazyComponent<typeof import("../../app/components/ProcurementFooter.vue")['default']>
  LazyProcurementMenuBar: LazyComponent<typeof import("../../app/components/ProcurementMenuBar.vue")['default']>
  LazyRegistrarChatCommunicationModal: LazyComponent<typeof import("../../app/components/Registrar/ChatCommunicationModal.vue")['default']>
  LazyRegistrarDeleteConfirmationModal: LazyComponent<typeof import("../../app/components/Registrar/DeleteConfirmationModal.vue")['default']>
  LazyRegistrarDocumentPreparationModal: LazyComponent<typeof import("../../app/components/Registrar/DocumentPreparationModal.vue")['default']>
  LazyRegistrarFilters: LazyComponent<typeof import("../../app/components/Registrar/Filters.vue")['default']>
  LazyRegistrarList: LazyComponent<typeof import("../../app/components/Registrar/List.vue")['default']>
  LazyRegistrarPagination: LazyComponent<typeof import("../../app/components/Registrar/Pagination.vue")['default']>
  LazyRegistrarPaymentDetailsModal: LazyComponent<typeof import("../../app/components/Registrar/PaymentDetailsModal.vue")['default']>
  LazyRegistrarPersonalInfoModal: LazyComponent<typeof import("../../app/components/Registrar/PersonalInfoModal.vue")['default']>
  LazyRegistrarReleasingDocumentsModal: LazyComponent<typeof import("../../app/components/Registrar/ReleasingDocumentsModal.vue")['default']>
  LazyRegistrarShowImageModal: LazyComponent<typeof import("../../app/components/Registrar/ShowImageModal.vue")['default']>
  LazyRegistrarStatusCounters: LazyComponent<typeof import("../../app/components/Registrar/StatusCounters.vue")['default']>
  LazyRegistrarStatusLogsModal: LazyComponent<typeof import("../../app/components/Registrar/StatusLogsModal.vue")['default']>
  LazyRegistrarTransactionClosedModal: LazyComponent<typeof import("../../app/components/Registrar/TransactionClosedModal.vue")['default']>
  LazyRegistrarVerifyErrorMessageToaster: LazyComponent<typeof import("../../app/components/Registrar/VerifyErrorMessageToaster.vue")['default']>
  LazyRegistrarVerifySuccessMessageToaster: LazyComponent<typeof import("../../app/components/Registrar/VerifySuccessMessageToaster.vue")['default']>
  LazyRegistrar: LazyComponent<typeof import("../../app/components/Registrar/index.vue")['default']>
  LazyRegistrarMenuBar: LazyComponent<typeof import("../../app/components/RegistrarMenuBar.vue")['default']>
  LazyRegistrarPrivacyPolicy: LazyComponent<typeof import("../../app/components/RegistrarPrivacyPolicy.vue")['default']>
  LazySDG: LazyComponent<typeof import("../../app/components/SDG.vue")['default']>
  LazyShortcuts: LazyComponent<typeof import("../../app/components/Shortcuts.vue")['default']>
  LazySlider: LazyComponent<typeof import("../../app/components/Slider.vue")['default']>
  LazySliderAlt: LazyComponent<typeof import("../../app/components/SliderAlt.vue")['default']>
  LazySliderInvestiture: LazyComponent<typeof import("../../app/components/SliderInvestiture.vue")['default']>
  LazySlides: LazyComponent<typeof import("../../app/components/Slides.vue")['default']>
  LazyStudentBlog: LazyComponent<typeof import("../../app/components/StudentBlog.vue")['default']>
  LazyStudents: LazyComponent<typeof import("../../app/components/Students.vue")['default']>
  LazySuperAdminDashboard: LazyComponent<typeof import("../../app/components/SuperAdminDashboard.vue")['default']>
  LazySuperAdminDashboardExternalLinks: LazyComponent<typeof import("../../app/components/SuperAdminDashboardExternalLinks.vue")['default']>
  LazySuperAdminDashboardLoading: LazyComponent<typeof import("../../app/components/SuperAdminDashboardLoading.vue")['default']>
  LazySuperAdminDashboardMenuList: LazyComponent<typeof import("../../app/components/SuperAdminDashboardMenuList.vue")['default']>
  LazySuperAdminDashboardNavigation: LazyComponent<typeof import("../../app/components/SuperAdminDashboardNavigation.vue")['default']>
  LazySuperAdminDashboardProfile: LazyComponent<typeof import("../../app/components/SuperAdminDashboardProfile.vue")['default']>
  LazySuperAdminDashboardRolePermissions: LazyComponent<typeof import("../../app/components/SuperAdminDashboardRolePermissions.vue")['default']>
  LazySuperAdminDashboardWelcome: LazyComponent<typeof import("../../app/components/SuperAdminDashboardWelcome.vue")['default']>
  LazyTUKIB: LazyComponent<typeof import("../../app/components/TUKIB.vue")['default']>
  LazyTestimonials: LazyComponent<typeof import("../../app/components/Testimonials.vue")['default']>
  LazyThankYouNotifFromFormSubmit: LazyComponent<typeof import("../../app/components/ThankYouNotifFromFormSubmit.vue")['default']>
  LazyTingogMagazine: LazyComponent<typeof import("../../app/components/TingogMagazine.vue")['default']>
  LazyToggleDarkLightMode: LazyComponent<typeof import("../../app/components/ToggleDarkLightMode.vue")['default']>
  LazyTotalAmount: LazyComponent<typeof import("../../app/components/TotalAmount.vue")['default']>
  LazyTotalDonationNumberOnly: LazyComponent<typeof import("../../app/components/TotalDonationNumberOnly.vue")['default']>
  LazyUniversityCalendar: LazyComponent<typeof import("../../app/components/UniversityCalendar.vue")['default']>
  LazyUniversityDashboard: LazyComponent<typeof import("../../app/components/UniversityDashboard.vue")['default']>
  LazyUniversityFeedbackWidget: LazyComponent<typeof import("../../app/components/UniversityFeedbackWidget.vue")['default']>
  LazyUniversityLogin: LazyComponent<typeof import("../../app/components/UniversityLogin.vue")['default']>
  LazyUpdatingPage: LazyComponent<typeof import("../../app/components/UpdatingPage.vue")['default']>
  LazyWaves: LazyComponent<typeof import("../../app/components/Waves.vue")['default']>
  /**
   * Lazy-loaded version of `<NuxtWelcome>`.
   *
   * Displays the welcome screen used by new Nuxt projects.
   *
   * @see https://nuxt.com/docs/4.x/api/components/nuxt-welcome
   */
  LazyNuxtWelcome: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/app/components/welcome.vue")['default']>
  /**
   * Lazy-loaded version of `<NuxtLayout>`.
   *
   * Renders the selected layout around pages or error content.
   *
   * @see https://nuxt.com/docs/4.x/api/components/nuxt-layout
   */
  LazyNuxtLayout: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
  /**
   * Lazy-loaded version of `<NuxtErrorBoundary>`.
   *
   * Catches client-side errors from its default slot and renders an error slot.
   *
   * @see https://nuxt.com/docs/4.x/api/components/nuxt-error-boundary
   */
  LazyNuxtErrorBoundary: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
  /**
   * Lazy-loaded version of `<ClientOnly>`.
   *
   * Renders its default slot only on the client, with an optional server fallback.
   *
   * @see https://nuxt.com/docs/4.x/api/components/client-only
   */
  LazyClientOnly: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/app/components/client-only")['default']>
  /**
   * Lazy-loaded version of `<DevOnly>`.
   *
   * Renders its content only during development.
   *
   * @see https://nuxt.com/docs/4.x/api/components/dev-only
   */
  LazyDevOnly: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/app/components/dev-only")['default']>
  LazyServerPlaceholder: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/app/components/server-placeholder")['default']>
  /**
   * Lazy-loaded version of `<NuxtLink>`.
   *
   * A drop-in replacement for Vue Router's `<RouterLink>` and the HTML `<a>` element.
   *
   * @see https://nuxt.com/docs/4.x/api/components/nuxt-link
   */
  LazyNuxtLink: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/app/components/nuxt-link")['default']>
  /**
   * Lazy-loaded version of `<NuxtLoadingIndicator>`.
   *
   * Displays a progress bar during page navigation.
   *
   * @see https://nuxt.com/docs/4.x/api/components/nuxt-loading-indicator
   */
  LazyNuxtLoadingIndicator: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
  /**
   * Lazy-loaded version of `<NuxtTime>`.
   *
   * Formats dates and times consistently across server and client using the user's locale.
   *
   * @see https://nuxt.com/docs/4.x/api/components/nuxt-time
   */
  LazyNuxtTime: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
  /**
   * Lazy-loaded version of `<NuxtRouteAnnouncer>`.
   *
   * Announces route changes to assistive technologies using the current page title.
   *
   * @see https://nuxt.com/docs/4.x/api/components/nuxt-route-announcer
   */
  LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
  /**
   * Lazy-loaded version of `<NuxtAnnouncer>`.
   *
   * Announces dynamic content changes to assistive technologies.
   *
   * @see https://nuxt.com/docs/4.x/api/components/nuxt-announcer
   */
  LazyNuxtAnnouncer: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/app/components/nuxt-announcer")['default']>
  /**
   * Lazy-loaded version of `<NuxtImg>`.
   *
   * Renders an optimized image through the Nuxt Image module.
   *
   * @see https://nuxt.com/docs/4.x/api/components/nuxt-img
   */
  LazyNuxtImg: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
  /**
   * Lazy-loaded version of `<NuxtPicture>`.
   *
   * Renders responsive optimized images through the Nuxt Image module.
   *
   * @see https://nuxt.com/docs/4.x/api/components/nuxt-picture
   */
  LazyNuxtPicture: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
  /**
   * Lazy-loaded version of `<NuxtPage>`.
   *
   * Renders the current page from the `pages/` directory.
   *
   * @see https://nuxt.com/docs/4.x/api/components/nuxt-page
   */
  LazyNuxtPage: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/pages/runtime/page")['default']>
  LazyNoScript: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/head/runtime/components")['NoScript']>
  LazyLink: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/head/runtime/components")['Link']>
  LazyBase: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/head/runtime/components")['Base']>
  LazyTitle: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/head/runtime/components")['Title']>
  LazyMeta: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/head/runtime/components")['Meta']>
  LazyStyle: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/head/runtime/components")['Style']>
  LazyHead: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/head/runtime/components")['Head']>
  LazyHtml: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/head/runtime/components")['Html']>
  LazyBody: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/head/runtime/components")['Body']>
  /**
   * Lazy-loaded version of `<NuxtIsland>`.
   *
   * Renders a non-interactive server component without shipping client-side JavaScript.
   *
   * @see https://nuxt.com/docs/4.x/api/components/nuxt-island
   */
  LazyNuxtIsland: LazyComponent<typeof import("../../node_modules/.pnpm/nuxt@4.6.2_@babel+plugin-sy_edd079e22ac5d4b554a3a507d5bc718e/node_modules/nuxt/dist/app/components/nuxt-island")['default']>
}

declare module 'vue' {
  export interface GlobalComponents extends _GlobalComponents { }
}

export {}
