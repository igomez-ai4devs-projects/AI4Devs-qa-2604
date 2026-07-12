# language: en
Feature: Position page loading
  As a Recruiter
  I want to open a position and see its interview pipeline with candidates placed by stage
  So that I can understand the state of the selection process at a glance

  Background:
    Given the Recruiter is authenticated in the ATS
    And a position "Senior Backend Engineer" exists with an interview flow of the stages:
      | order | stage             |
      | 1     | Initial Screening |
      | 2     | Technical Interview |
      | 3     | Manager Interview |
      | 4     | Offer             |

  Scenario: Recruiter opens a position and sees its interview pipeline
    When the Recruiter opens the position "Senior Backend Engineer"
    Then the pipeline shows the stages in this order:
      | Initial Screening   |
      | Technical Interview |
      | Manager Interview   |
      | Offer               |
    And the pipeline is titled with the position name "Senior Backend Engineer"

  Scenario: Candidates are shown in their current stage
    Given the following candidates are applying to "Senior Backend Engineer":
      | candidate     | current stage       |
      | Alice Johnson | Initial Screening   |
      | Bob Martin    | Technical Interview |
      | Carol Diaz    | Technical Interview |
    When the Recruiter opens the position "Senior Backend Engineer"
    Then "Alice Johnson" appears in the "Initial Screening" stage
    And "Bob Martin" and "Carol Diaz" appear in the "Technical Interview" stage
    And the "Manager Interview" and "Offer" stages have no candidates

  Scenario: Position with no applicants shows an empty pipeline
    Given no candidates are applying to "Senior Backend Engineer"
    When the Recruiter opens the position "Senior Backend Engineer"
    Then every stage of the pipeline is shown without candidates
    And no error is reported to the Recruiter

  Scenario Outline: Candidate average interview score is shown on the pipeline
    Given the candidate "<candidate>" is applying to "Senior Backend Engineer"
    And the candidate "<candidate>" has the interview scores "<scores>"
    When the Recruiter opens the position "Senior Backend Engineer"
    Then the candidate "<candidate>" shows an average score of "<average>"

    Examples:
      | candidate     | scores  | average |
      | Alice Johnson | 4,5,3   | 4       |
      | Bob Martin    | 2,4     | 3       |
      | Carol Diaz    |         | 0       |

  Scenario: Opening a position that does not exist
    Given no position named "Ghost Position" exists
    When the Recruiter opens the position "Ghost Position"
    Then the pipeline is not displayed
    And the Recruiter is informed that the position could not be found
