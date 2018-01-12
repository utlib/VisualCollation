FactoryGirl.define do
  sequence :note_title do |n|
    "Note #{n}"
  end
  sequence :note_text do |n|
    "Blah #{n}"
  end
  
  factory :note do
    transient do
      attachments []
    end
    before(:build) do |note, evaluator|
      myobjects = {Group: [], Leaf: [], Recto: [], Verso: []}
      evaluator.attachments.each do |attachment|
        if attachment.is_a? Group
          myobjects[:Group] << attachment
        elsif attachment.is_a? Leaf
          myobjects[:Leaf] << attachment
        elsif attachment.is_a? Side
          if attachment.id.to_s[0..5] == 'Verso_'
            myobjects[:Verso] << attachment
          else
            myobjects[:Recto] << attachment
          end
        else
          raise Exception('Notes can only be attached to groups, leafs and sides')
        end
      end
    end
    title { generate(:note_title) }
    type "Unknown"
  end
end
