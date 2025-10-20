<h1 align="center">📄 DocuFlow</h1>

<p align="center">
  <em>"A simple act of caring creates an endless ripple."</em>  
</p>

<p align="center">
  <b>DocuFlow</b> is an intelligent Document Workflow Management System that streamlines document submission, review, and approval.  
  Designed for teams who care about collaboration, transparency, and quality.  
</p>

---

<p align="center">
  <img src="https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white"/>
  <img src="https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/>
  <img src="https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white"/>
  <img src="https://img.shields.io/badge/JWT-SecureAuth-red?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Made%20with❤️by-Prashant_Bhusnar-blue?style=for-the-badge"/>
</p>

---

## 🌟 Overview

**DocuFlow** brings structure and efficiency to document management.  
It allows users to **upload**, **review**, and **approve** documents through a secure, role-based workflow — ensuring every submission gets the attention it deserves.

✅ **Roles:** Submitter, Reviewer, Approver  
✅ **Core Features:** Upload → Review → Approve/Reject → Final Approval  
✅ **Goal:** Simplify document communication and tracking across teams.

---

## 🧠 Core Features

| Role | Description |
|------|--------------|
| **Submitter** | Uploads documents with title, type, and description |
| **Reviewer** | Reviews, comments, and marks as approved/rejected |
| **Approver** | Gives final approval for organization-level acceptance |
| **System** | Tracks progress, notifies users, and maintains logs |

---

## 🏗️ Architecture

```mermaid
flowchart TD
    A[Submitter] -->|Uploads Document| B[Backend - Spring Boot]
    B --> C[(Database - MySQL)]
    B --> D[Reviewer Dashboard - React]
    D -->|Review & Comment| B
    B --> E[Approver Dashboard - React]
    E -->|Approve/Reject| B
    B --> F[Document Status Updated 🔁]
