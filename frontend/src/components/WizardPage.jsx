import SiteHeader from './SiteHeader'
import InquiryWizard from './InquiryWizard'
import ChatBot from './ChatBot'
import styles from './WizardPage.module.css'

export default function WizardPage() {
  return (
    <>
      <SiteHeader />
      <div className={styles.page}>
        <InquiryWizard />
      </div>
      <ChatBot />
    </>
  )
}
