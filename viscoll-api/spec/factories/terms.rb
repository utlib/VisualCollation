FactoryGirl.define do
  sequence :term_title do |n|
    "Term #{n}"
  end
  sequence :term_text do |n|
    "Blah #{n}"
  end

  factory :term do
    transient do
      attachments []
    end
    before(:build) do |term, evaluator|
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
          raise Exception('Terms can only be attached to groups, leafs and sides')
        end
      end
    end
    title { generate(:term_title) }
    taxonomy "Unknown"
  end
end
