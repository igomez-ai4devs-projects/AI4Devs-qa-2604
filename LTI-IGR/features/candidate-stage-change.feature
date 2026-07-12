# language: en
Feature: Candidate stage change
  As a Recruiter
  I want to move a candidate through the interview pipeline of a position
  So that the candidate's progress is reflected and kept accurate

  Background:
    Given the Recruiter is authenticated in the ATS
    And the position "Senior Backend Engineer" has the pipeline stages:
      | Initial Screening   |
      | Technical Interview |
      | Manager Interview   |
      | Offer               |
    And the candidate "Alice Johnson" is applying to "Senior Backend Engineer" in the "Initial Screening" stage

  Scenario: Recruiter advances a candidate to the next stage
    When the Recruiter moves "Alice Johnson" to the "Technical Interview" stage
    Then "Alice Johnson" is shown in the "Technical Interview" stage
    And the candidate's current stage is saved as "Technical Interview"

  Scenario: Recruiter moves a candidate back to an earlier stage
    Given the candidate "Alice Johnson" is in the "Manager Interview" stage
    When the Recruiter moves "Alice Johnson" to the "Technical Interview" stage
    Then "Alice Johnson" is shown in the "Technical Interview" stage
    And the candidate's current stage is saved as "Technical Interview"

  Scenario: Releasing a candidate outside any stage leaves the pipeline unchanged
    When the Recruiter releases "Alice Johnson" outside of any stage
    Then "Alice Johnson" remains in the "Initial Screening" stage
    And no stage change is saved

  Scenario: Keeping a candidate in the same stage does not change the process
    When the Recruiter moves "Alice Johnson" to the "Initial Screening" stage
    Then "Alice Johnson" remains in the "Initial Screening" stage

  Scenario Outline: Invalid stage changes are rejected without altering the pipeline
    When the Recruiter attempts to move "<candidate>" using "<condition>"
    Then the stage change is rejected as "<reason>"
    And the candidate's current stage remains unchanged

    Examples:
      | candidate     | condition                         | reason              |
      | Alice Johnson | an application that does not exist | application not found |
      | Alice Johnson | an unrecognized application reference | invalid request     |
      | Alice Johnson | an unrecognized target stage      | invalid request     |

  Scenario: A candidate move that fails to save does not leave a false progress
    Given saving stage changes is temporarily unavailable
    When the Recruiter moves "Alice Johnson" to the "Technical Interview" stage
    Then "Alice Johnson" is not presented as advanced to the "Technical Interview" stage
    And the Recruiter is informed that the change was not saved
