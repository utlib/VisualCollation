require 'rails_helper'

RSpec.describe Image, type: :model do
  it { is_expected.to be_mongoid_document }
  
  it { is_expected.to have_field(:filename).of_type(String) }
  it { is_expected.to have_field(:projectIDs).of_type(Array) }
  it { is_expected.to have_field(:sideIDs).of_type(Array) }
  
  it { is_expected.to belong_to(:user) }
  
  before(:each) do
    @user = FactoryGirl.create(:user)
    @project = FactoryGirl.create(:codex_project, user: @user, quire_structure: [[1, 2]])
    @image = FactoryGirl.create(:pixel, user: @user)
  end
  
  describe 'Validations' do
    it 'should be valid to start with' do
      expect(@image).to be_valid
    end
    
    it 'should not be valid with a duplicate file name' do
      duplicate_image = FactoryGirl.build(:shiba_inu, user: @user, filename: @image.filename)
      expect(duplicate_image).not_to be_valid
    end
  end
  
  describe 'Side unlinking hook' do
    before do
      @side = @project.sides[1]
      @side.update(image: {
        manifestID: 'DIYImages',
        label: 'pixel.png',
        url: 'http://127.0.0.1:3001/pixel.png'
      })
      @image.update(sideIDs: [@side.id.to_s])
    end
    
    it 'should unhook the side upon deletion' do
      @image.destroy
      @side.reload
      expect(@side.image).to be_blank
    end
  end
end
